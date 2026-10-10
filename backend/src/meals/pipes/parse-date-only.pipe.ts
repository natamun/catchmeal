import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isDateString } from 'class-validator';

export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

@Injectable()
export class ParseDateOnlyPipe implements PipeTransform<
  unknown,
  Date | undefined
> {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (value === undefined) return undefined;
    if (
      typeof value !== 'string' ||
      !DATE_ONLY_PATTERN.test(value) ||
      !isDateString(value, { strict: true })
    )
      throw new BadRequestException(
        `${metadata.data ?? 'date'} must be a valid date formatted as YYYY-MM-DD`,
      );
    return new Date(value);
  }
}
