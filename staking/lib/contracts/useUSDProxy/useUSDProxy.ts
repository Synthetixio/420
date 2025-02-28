import { importUSDProxy } from '@_/contracts';
import { Network, useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';

export function useUSDProxy(customNetwork?: Network) {
  const { network } = useNetwork();
  const targetNetwork = customNetwork || network;

  return useQuery({
    queryKey: [`${targetNetwork?.id}-${targetNetwork?.preset}`, 'USDProxy'],
    enabled: Boolean(targetNetwork),
    queryFn: async function () {
      if (!targetNetwork) throw new Error('OMFG');
      return importUSDProxy(targetNetwork.id, targetNetwork.preset);
    },
    staleTime: Infinity,
    // On some chains this is not available, and that is expected
    throwOnError: false,
  });
}
