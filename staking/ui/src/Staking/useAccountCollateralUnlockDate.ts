import { contractsHash } from '@_/format';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';

export function useAccountCollateralUnlockDate({ accountId }: { accountId?: ethers.BigNumber }) {
  const { data: CoreProxy } = useCoreProxy();
  const { network } = useNetwork();
  const provider = useProvider();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useAccountCollateralUnlockDate',
      { accountId },
      { contractsHash: contractsHash([CoreProxy]) },
    ],
    enabled: Boolean(provider && CoreProxy && accountId),
    queryFn: async () => {
      if (!(provider && CoreProxy && accountId)) throw 'OMFG';
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const [lastInteraction, accountTimeoutWithdraw] = await Promise.all([
        CoreProxyContract.getAccountLastInteraction(accountId),
        CoreProxyContract.getConfigUint(ethers.utils.formatBytes32String('accountTimeoutWithdraw')),
      ]);
      const collateralUnlock = lastInteraction.add(accountTimeoutWithdraw);
      return new Date(collateralUnlock.toNumber() * 1000);
    },
  });
}
