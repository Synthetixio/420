import { importPool420Withdraw } from '@_/contracts';
import { Network, useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';

export function usePool420Withdraw(customNetwork?: Network) {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork ?? currentNetwork;

  return useQuery({
    queryKey: [`${network?.id}-${network?.preset}`, 'Pool420Withdraw'],
    enabled: Boolean(network),
    queryFn: async function () {
      if (!network) throw 'OMFG';
      return importPool420Withdraw(network.id, network.preset);
    },
    staleTime: Infinity,
    // On some chains this is not available, and that is expected
    throwOnError: false,
  });
}
