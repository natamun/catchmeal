import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LoaderCircle, ScanBarcode, Search } from 'lucide-react';

import { useCurrentUser } from '../../auth/auth-context';
import { useHasCamera } from '../../hooks/useHasCamera';
import { useTimeout } from '../../hooks/useTimeout';
import { ApiError } from '../../utils/request';
import { FieldError } from '../ui/FieldError';
import { Input } from '../ui/Input';
import { lookupOffProduct } from './api';
import { isValidBarcode } from './barcode';
import type { OffProduct } from './types';

const BarcodeScannerDialog = lazy(() => import('./BarcodeScannerDialog'));

const LABEL_CLASS =
  'text-xs font-semibold tracking-wide text-green-500 uppercase';

const ICON_BUTTON_CLASS =
  'flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-green-200 text-green-600 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60';

const OFF_URL = 'https://world.openfoodfacts.org';

const INVALID_BARCODE = 'Code-barres invalide';

const LOOKUP_ERRORS: Partial<Record<number, string>> = {
  400: INVALID_BARCODE,
  429: 'Trop de recherches, patientez 1 min',
  503: 'Open Food Facts ne répond pas',
};

interface BarcodeFieldProps {
  value: string;
  error?: string;
  showError: boolean;
  onChange: (value: string) => void;
  onProduct: (product: OffProduct) => void;
}

export default function BarcodeField({
  value,
  error,
  showError,
  onChange,
  onProduct,
}: BarcodeFieldProps) {
  const { userId } = useCurrentUser();
  const hasCamera = useHasCamera();
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [foundBarcode, setFoundBarcode] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<{
    message: string;
    onField: boolean;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lookupIdRef = useRef(0);

  if (showError && !isTouched) {
    setIsTouched(true);
  }

  useEffect(() => {
    const lookupId = lookupIdRef;
    return () => {
      lookupId.current += 1;
    };
  }, []);

  useTimeout(() => setLookupError(null), lookupError ? 5000 : null);

  const barcode = value.trim();

  const runLookup = async (code: string) => {
    lookupIdRef.current += 1;
    const lookupId = lookupIdRef.current;
    if (!isValidBarcode(code)) {
      setLookupError({ message: INVALID_BARCODE, onField: true });
      return;
    }
    setIsLookingUp(true);
    try {
      const product = await lookupOffProduct(userId, code);
      if (lookupId !== lookupIdRef.current) {
        return;
      }
      if (!product) {
        setLookupError({ message: 'Produit introuvable', onField: false });
        return;
      }
      setFoundBarcode(product.barcode);
      setIsTouched(false);
      onProduct(product);
    } catch (err: unknown) {
      if (lookupId !== lookupIdRef.current) {
        return;
      }
      const status = err instanceof ApiError ? err.status : 0;
      setLookupError({
        message: LOOKUP_ERRORS[status] ?? 'Une erreur est survenue',
        onField: status === 400,
      });
    } finally {
      if (lookupId === lookupIdRef.current) {
        setIsLookingUp(false);
      }
    }
  };

  const handleLookup = async () => {
    if (barcode === '' || isLookingUp) {
      return;
    }
    setLookupError(null);
    if (error) {
      setIsTouched(true);
      inputRef.current?.focus();
      return;
    }

    await runLookup(barcode);
  };

  const handleScanned = (scannedBarcode: string) => {
    setIsScannerOpen(false);
    onChange(scannedBarcode);
    setLookupError(null);
    void runLookup(scannedBarcode);
  };

  const formatError = isTouched && (isFocused || showError) ? error : undefined;

  return (
    <>
      <div className="relative flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="food-barcode" className={LABEL_CLASS}>
            Code-barres (optionnel)
          </label>
          <a
            href={
              foundBarcode !== null && foundBarcode === barcode
                ? `${OFF_URL}/product/${foundBarcode}`
                : OFF_URL
            }
            target="_blank"
            rel="noreferrer"
            title="Données fournies par Open Food Facts"
            className="flex shrink-0 items-center gap-1 text-xs text-green-500 transition-colors hover:text-green-700"
          >
            <span>
              via <span className="max-[400px]:hidden">Open Food Facts</span>
              <span className="min-[400px]:hidden">OFF</span>
            </span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <div className="flex gap-2">
          <Input
            id="food-barcode"
            type="text"
            inputMode="numeric"
            placeholder="Ex : 7612100018477"
            ref={inputRef}
            value={value}
            readOnly={isLookingUp}
            onChange={(e) => {
              onChange(e.target.value);
              setLookupError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void handleLookup();
              }
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsTouched(true);
              setIsFocused(false);
            }}
            aria-invalid={Boolean(isTouched && error) || lookupError?.onField}
            aria-describedby="food-barcode-error"
          />
          {hasCamera && (
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              disabled={isLookingUp}
              aria-label="Scanner un code-barres"
              className={ICON_BUTTON_CLASS}
            >
              <ScanBarcode className="h-4 w-4" />
            </button>
          )}
          <div className="relative flex shrink-0">
            <button
              type="button"
              onClick={() => void handleLookup()}
              disabled={barcode === '' || isLookingUp}
              aria-label="Rechercher le produit"
              aria-describedby="food-lookup-error"
              className={ICON_BUTTON_CLASS}
            >
              {isLookingUp ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
            <FieldError
              id="food-lookup-error"
              align="right"
              message={
                lookupError && !lookupError.onField
                  ? lookupError.message
                  : undefined
              }
            />
          </div>
        </div>
        <FieldError
          id="food-barcode-error"
          message={lookupError?.onField ? lookupError.message : formatError}
        />
      </div>

      {isScannerOpen && (
        <Suspense fallback={null}>
          <BarcodeScannerDialog
            onDetected={handleScanned}
            onClose={() => setIsScannerOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
