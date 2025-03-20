import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProviderForChain } from '@_/useBlockchain';
import type { CollateralType } from '@_/useCollateralTypes';
import { useCoreProxy } from '@_/useCoreProxy';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';

export function useLocks({
  accountId,
  collateralType,
}: {
  accountId?: ethers.BigNumber;
  collateralType?: CollateralType;
}) {
  const { network } = useNetwork();
  const { data: CoreProxy } = useCoreProxy();
  const provider = useProviderForChain();

  return useQuery({
    enabled: Boolean(provider && CoreProxy && accountId && collateralType),
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useLocks',
      { accountId, collateralType },
      { contractsHash: contractsHash([CoreProxy]) },
    ],
    queryFn: async () => {
      if (!(provider && CoreProxy && accountId && collateralType)) throw 'OMFG';
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const locks: {
        amountD18: ethers.BigNumber;
        lockExpirationTime: ethers.BigNumber;
      }[] = await CoreProxyContract.getLocks(accountId, collateralType.tokenAddress, 0, 100);

      return locks;
    },
  });
}
