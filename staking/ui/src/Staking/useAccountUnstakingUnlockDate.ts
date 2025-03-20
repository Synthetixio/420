import { useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';
import type { ethers } from 'ethers';
import { useLoan } from './useLoan';
import { useMarketMinDelegateTime } from './useMarketMinDelegateTime';

export function useAccountUnstakingUnlockDate({
  accountId,
}: {
  accountId?: ethers.BigNumber;
}) {
  const { network } = useNetwork();
  const { data: marketMinDelegateTime } = useMarketMinDelegateTime();
  const { data: loan } = useLoan();
  return useQuery({
    queryKey: [`${network?.id}-${network?.preset}`, 'AccountUnstakeUnlockDate', { accountId }],
    enabled: Boolean(loan && marketMinDelegateTime),
    queryFn: async () => {
      if (!(loan && marketMinDelegateTime)) throw 'OMFG';
      return new Date(loan.startTime.add(marketMinDelegateTime).mul(1000).toNumber());
    },
  });
}
