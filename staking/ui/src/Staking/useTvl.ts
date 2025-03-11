import { fetchPythPrice } from '@_/usePythPrice';
import { wei } from '@synthetixio/wei';
import { useQuery } from '@tanstack/react-query';

export async function fetchStakedSnx() {
  const response = await fetch('https://api.synthetix.io/staking-ratio');
  const {
    stakedSnx: { ethereum, optimism },
  } = await response.json();
  return ethereum + optimism;
}

export function useTvl() {
  return useQuery({
    queryKey: ['tvl'],
    queryFn: async () => {
      const [snxPrice, stakedSnx] = await Promise.all([fetchPythPrice('SNX'), fetchStakedSnx()]);
      if (!snxPrice) {
        throw new Error('SNX price not found');
      }
      return wei(snxPrice).mul(stakedSnx).toNumber();
    },
    staleTime: 600_000,
  });
}
