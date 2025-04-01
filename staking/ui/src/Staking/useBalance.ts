import { useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import type { ethers } from 'ethers';
import { type Balance, useBalances } from './useBalances';

const log = debug('snx:useBalance');

export function useBalance({ accountId }: { accountId: ethers.BigNumber }) {
  const { network } = useNetwork();
  const { data: balances, dataUpdatedAt } = useBalances();

  return useQuery<Balance, Error>({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useBalance',
      { accountId },
      { balances: dataUpdatedAt },
    ],
    enabled: Boolean(balances && accountId),
    queryFn: async () => {
      if (!(balances && accountId)) {
        throw new Error('OMFG');
      }
      log('accountId', accountId);
      const balance = balances.find((p) => p.accountId.eq(accountId));
      log('balance', balance);
      if (!balance) {
        throw new Error('Balance not found for account');
      }
      return balance;
    },
  });
}
