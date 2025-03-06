import { useQuery } from '@tanstack/react-query';

export async function fetchTvl420({
  networkName,
  span,
}: {
  networkName: 'cross' | 'ethereum' | 'optimism';
  span: 'hourly' | 'daily' | 'weekly' | 'monthly';
}) {
  const url = new URL('/v3/tvl420', 'https://api.synthetix.io');
  url.searchParams.append('network', encodeURIComponent(networkName));
  url.searchParams.append('span', encodeURIComponent(span));
  const response = await fetch(url);
  return response.json();
}

export function useTvl420({
  networkName,
  span,
}: {
  networkName: 'cross' | 'ethereum' | 'optimism';
  span: 'hourly' | 'daily' | 'weekly' | 'monthly';
}) {
  return useQuery({
    queryKey: ['useTvl420', { networkName, span }],
    enabled: Boolean(networkName && span),
    queryFn: async () => {
      if (!(networkName && span)) {
        throw new Error('OMFG');
      }
      const tvl420 = await fetchTvl420({ networkName, span });
      if (!tvl420) {
        return [];
      }
      return tvl420.map(({ ts, value }: { ts: string; value: string }) => ({
        ts: new Date(ts),
        value: Number.parseFloat(value),
      }));
    },
    staleTime: 600_000,
  });
}
