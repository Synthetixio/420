import { Amount } from '@_/Amount';
import { wei } from '@synthetixio/wei';

export function CRatioAmount({ value }: { value: number }) {
  if (!value || value < 0) {
    return <>N/A</>;
  }
  if (value >= Number.MAX_SAFE_INTEGER) {
    return <>Infinite</>;
  }
  return <Amount value={wei(Math.round(value))} suffix="%" />;
}
