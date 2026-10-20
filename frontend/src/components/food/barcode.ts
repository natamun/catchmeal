const BARCODE_PATTERN = /^\d{8,14}$/;

export function isValidBarcode(code: string) {
  if (!BARCODE_PATTERN.test(code)) {
    return false;
  }

  const digits = code.padStart(14, '0').split('').map(Number);
  const sum = digits
    .slice(0, 13)
    .reduce((acc, digit, i) => acc + digit * (i % 2 === 0 ? 3 : 1), 0);

  return (10 - (sum % 10)) % 10 === digits[13];
}
