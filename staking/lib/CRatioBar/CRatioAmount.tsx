export function CRatioAmount({ value }: { value: number }) {
  if (!value || value < 0) {
    return 'N/A';
  }
  if (value >= Number.MAX_SAFE_INTEGER) {
    return 'Infinite';
  }
  return `${Math.round(value)}%`;
}
