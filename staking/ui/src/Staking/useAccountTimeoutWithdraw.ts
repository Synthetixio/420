import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';

export function useAccountTimeoutWithdraw() {
  const { data: CoreProxy } = useCoreProxy();
  const { network } = useNetwork();
  const provider = useProvider();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'AccountTimeoutWithdraw',
      { contractsHash: contractsHash([CoreProxy]) },
    ],
    enabled: Boolean(provider && CoreProxy),
    queryFn: async () => {
      if (!(provider && CoreProxy)) throw 'OMFG';
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const [accountTimeoutWithdraw] = await Promise.all([
        CoreProxyContract.getConfigUint(ethers.utils.formatBytes32String('accountTimeoutWithdraw')),
      ]);
      return accountTimeoutWithdraw;
    },
  });
}
