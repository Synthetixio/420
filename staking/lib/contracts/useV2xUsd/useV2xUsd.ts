import { importV2xUsd } from '@_/contracts';
import { Network, useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';

export function useV2xUsd(customNetwork?: Network) {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork || currentNetwork;

  return useQuery({
    queryKey: [`${network?.id}-${network?.preset}`, 'V2xUsd'],
    enabled: Boolean(network),
    queryFn: async function () {
      if (!network) throw new Error('OMFG');
      return importV2xUsd(network.id, network.preset);
    },
    staleTime: Infinity,
    // On some chains this is not available, and that is expected
    throwOnError: false,
  });
}
