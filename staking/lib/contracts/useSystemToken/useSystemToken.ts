import { importSystemToken } from '@_/contracts';
import { Network, useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';

export function useSystemToken(customNetwork?: Network) {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork || currentNetwork;

  return useQuery({
    queryKey: [`${network?.id}-${network?.preset}`, 'SystemToken'],
    enabled: Boolean(network),
    queryFn: async function (): Promise<{
      address: string;
      symbol: string;
      name: string;
      decimals: number;
    }> {
      if (!network) throw new Error('OMFG');
      const systemToken = await importSystemToken(network.id, network.preset);
      return systemToken;
    },
    staleTime: Infinity,
    // On some chains this is not available, and that is expected
    throwOnError: false,
  });
}
