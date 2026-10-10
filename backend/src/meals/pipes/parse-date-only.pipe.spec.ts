import { ArgumentMetadata, BadRequestException } from '@nestjs/common';

import { ParseDateOnlyPipe } from './parse-date-only.pipe';

describe('ParseDateOnlyPipe', () => {
  const pipe = new ParseDateOnlyPipe();
  const metadata: ArgumentMetadata = { type: 'query', data: 'date' };

  it('should turn a YYYY-MM-DD string into a date', () => {
    expect(pipe.transform('2026-09-18', metadata)).toEqual(
      new Date('2026-09-18'),
    );
  });

  it('should accept a leap day', () => {
    expect(pipe.transform('2024-02-29', metadata)).toEqual(
      new Date('2024-02-29'),
    );
  });

  it('should let a missing value through', () => {
    expect(pipe.transform(undefined, metadata)).toBeUndefined();
  });

  it('should reject a date that does not exist', () => {
    expect(() => pipe.transform('2026-02-30', metadata)).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform('2025-02-29', metadata)).toThrow(
      BadRequestException,
    );
  });

  it('should reject a date carrying a time', () => {
    expect(() => pipe.transform('2026-09-18T00:30:00+02:00', metadata)).toThrow(
      BadRequestException,
    );
  });

  it('should reject anything that is not formatted as YYYY-MM-DD', () => {
    expect(() => pipe.transform('20260918', metadata)).toThrow(
      BadRequestException,
    );
    expect(() => pipe.transform('', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform(['2026-09-18'], metadata)).toThrow(
      BadRequestException,
    );
  });
});
