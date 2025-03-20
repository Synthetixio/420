import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProviderForChain } from '@_/useBlockchain';
import type { CollateralType } from '@_/useCollateralTypes';
import { useCoreProxy } from '@_/useCoreProxy';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useLocks');

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
      if (!(provider && CoreProxy && accountId && collateralType)) {
        throw new Error('OMFG');
      }
      log('accountId', accountId);

      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const allLocks: {
        amountD18: ethers.BigNumber;
        lockExpirationTime: ethers.BigNumber;
      }[] = await CoreProxyContract.getLocks(accountId, collateralType.tokenAddress, 0, 100);
      const now = Math.floor(Date.now() / 1000);
      const locks = allLocks
        .filter((lock) => lock.lockExpirationTime.gt(now))
        .sort((a, b) => (a.lockExpirationTime.gt(b.lockExpirationTime) ? 1 : -1));
      log('locks', locks);

      return locks;
    },
  });
}
