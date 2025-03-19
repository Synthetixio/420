import { importPool420 } from '@_/contracts';
import { Network, useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';

export function usePool420(customNetwork?: Network) {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork ?? currentNetwork;

  return useQuery({
    queryKey: [`${network?.id}-${network?.preset}`, 'Pool420'],
    enabled: Boolean(network),
    queryFn: async function () {
      if (!network) throw 'OMFG';
      return importPool420(network.id, network.preset);
    },
    staleTime: Infinity,
    // On some chains this is not available, and that is expected
    throwOnError: false,
  });
}
