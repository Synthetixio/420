import { contractsHash } from '@_/format';
import { useNetwork, useProviderForChain } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { useSNX } from '@_/useSNX';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useLocks');

export function useLocks({ accountId }: { accountId: ethers.BigNumber }) {
  const { network } = useNetwork();
  const provider = useProviderForChain();
  const { data: CoreProxy } = useCoreProxy();
  const { data: SNX } = useSNX();

  return useQuery({
    enabled: Boolean(provider && CoreProxy && accountId && SNX),
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useLocks',
      { accountId },
      { contractsHash: contractsHash([CoreProxy, SNX]) },
    ],
    queryFn: async () => {
      if (!(provider && CoreProxy && accountId && SNX)) {
        throw new Error('OMFG');
      }
      log('accountId', accountId);

      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const allLocks: {
        amountD18: ethers.BigNumber;
        lockExpirationTime: ethers.BigNumber;
      }[] = await CoreProxyContract.getLocks(accountId, SNX.address, 0, 100);
      const now = Math.floor(Date.now() / 1000);
      const locks = allLocks
        .filter((lock) => lock.lockExpirationTime.gt(now))
        .sort((a, b) => (a.lockExpirationTime.gt(b.lockExpirationTime) ? 1 : -1));
      log('locks', locks);

      return locks;
    },
  });
}
