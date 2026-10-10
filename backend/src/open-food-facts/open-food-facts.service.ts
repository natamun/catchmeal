import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { QuantityUnit } from '../generated/prisma/enums';

const API_URL = 'https://world.openfoodfacts.org';
const FIELDS =
  'code,product_name,product_name_fr,brands,quantity,product_quantity_unit,nutriments';
const TIMEOUT_MS = 5000;
const FOUND_TTL_MS = 24 * 60 * 60 * 1000;
const NOT_FOUND_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const MAX_CALLS_PER_MINUTE = 12;
const KJ_PER_KCAL = 4.184;

export interface OffProduct {
  barcode: string;
  name: string | null;
  brand: string | null;
  baseQuantity: number;
  baseUnit: QuantityUnit;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

interface OffResponse {
  code?: unknown;
  product?: {
    product_name?: unknown;
    product_name_fr?: unknown;
    brands?: unknown;
    product_quantity_unit?: unknown;
    nutriments?: Record<string, unknown>;
  };
}

const toText = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : null;

const toAmount = (value: unknown) => {
  const amount =
    typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof amount === 'number' && Number.isFinite(amount) && amount >= 0
    ? Math.round(amount * 10) / 10
    : null;
};

@Injectable()
export class OpenFoodFactsService {
  private readonly userAgent = process.env.OFF_USER_AGENT || 'CatCHMeal/1.0';
  private readonly cache = new Map<
    string,
    { product: OffProduct | null; expiresAt: number }
  >();
  private callTimes: number[] = [];

  async lookup(rawBarcode: string): Promise<OffProduct> {
    const barcode = this.normalizeBarcode(rawBarcode);

    const cached = this.cache.get(barcode);
    if (cached && cached.expiresAt > Date.now()) {
      if (!cached.product) throw new NotFoundException('Product not found');
      return cached.product;
    }

    const product = await this.fetchProduct(barcode);
    this.remember(barcode, product);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  private normalizeBarcode(raw: string) {
    if (!/^\d{8,14}$/.test(raw))
      throw new BadRequestException('barcode must be 8 to 14 digits');

    const digits = raw.padStart(14, '0').split('').map(Number);
    const sum = digits
      .slice(0, 13)
      .reduce((acc, digit, i) => acc + digit * (i % 2 === 0 ? 3 : 1), 0);
    if ((10 - (sum % 10)) % 10 !== digits[13])
      throw new BadRequestException('barcode has a wrong check digit');

    const significant = raw.replace(/^0+/, '');
    return significant.padStart(significant.length <= 8 ? 8 : 13, '0');
  }

  private async fetchProduct(barcode: string) {
    const now = Date.now();
    this.callTimes = this.callTimes.filter((time) => time > now - 60000);
    if (this.callTimes.length >= MAX_CALLS_PER_MINUTE)
      throw new HttpException(
        'Too many lookups, try again in a minute',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    this.callTimes.push(now);

    try {
      const response = await fetch(
        `${API_URL}/api/v3.4/product/${barcode}?fields=${FIELDS}`,
        {
          headers: { 'User-Agent': this.userAgent },
          signal: AbortSignal.timeout(TIMEOUT_MS),
        },
      );
      if (response.status === 404) return null;
      if (!response.ok)
        throw new Error(`Open Food Facts returned ${response.status}`);

      const body = (await response.json()) as OffResponse;
      if (!body.product) return null;
      return this.toProduct(barcode, body);
    } catch (error) {
      console.error('Open Food Facts lookup failed: ', error);
      throw new ServiceUnavailableException('Open Food Facts is unavailable');
    }
  }

  private toProduct(barcode: string, body: OffResponse): OffProduct {
    const product = body.product ?? {};
    const nutriments = product.nutriments ?? {};
    const kj = toAmount(nutriments['energy-kj_100g'] ?? nutriments.energy_100g);

    return {
      barcode: toText(body.code) ?? barcode,
      name: toText(product.product_name_fr) ?? toText(product.product_name),
      brand: toText(toText(product.brands)?.split(',')[0]),
      baseQuantity: 100,
      baseUnit:
        toText(product.product_quantity_unit)?.toLowerCase() === 'ml'
          ? QuantityUnit.MILLILITER
          : QuantityUnit.GRAM,
      kcal:
        toAmount(nutriments['energy-kcal_100g']) ??
        (kj === null ? null : toAmount(kj / KJ_PER_KCAL)),
      protein: toAmount(nutriments.proteins_100g),
      carbs: toAmount(nutriments.carbohydrates_100g),
      fat: toAmount(nutriments.fat_100g),
    };
  }

  private remember(barcode: string, product: OffProduct | null) {
    this.cache.delete(barcode);
    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      const [oldest] = this.cache.keys();
      this.cache.delete(oldest);
    }
    this.cache.set(barcode, {
      product,
      expiresAt: Date.now() + (product ? FOUND_TTL_MS : NOT_FOUND_TTL_MS),
    });
  }
}
