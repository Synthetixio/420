import { useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';
import type { ethers } from 'ethers';
import { useMarketMinDelegateTime } from './useMarketMinDelegateTime';
import { usePosition } from './usePosition';

export function useAccountUnstakingUnlockDate({
  accountId,
}: {
  accountId: ethers.BigNumber;
}) {
  const { network } = useNetwork();
  const { data: marketMinDelegateTime } = useMarketMinDelegateTime();
  const { data: position } = usePosition({ accountId });
  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useAccountUnstakingUnlockDate',
      { accountId },
    ],
    enabled: Boolean(position && marketMinDelegateTime),
    queryFn: async () => {
      if (!(position && marketMinDelegateTime)) {
        throw new Error('OMFG');
      }
      return new Date(position.loanStartTime.add(marketMinDelegateTime).mul(1000).toNumber());
    },
  });
}
