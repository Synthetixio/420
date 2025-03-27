import { useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import type { ethers } from 'ethers';
import { type Position, usePositions } from './usePositions';

const log = debug('snx:usePosition');

export function usePosition({ accountId }: { accountId: ethers.BigNumber }) {
  const { network } = useNetwork();
  const { data: positions, dataUpdatedAt } = usePositions();

  return useQuery<Position, Error>({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'usePosition',
      { accountId },
      { positions: dataUpdatedAt },
    ],
    enabled: Boolean(positions && accountId),
    queryFn: async () => {
      if (!(positions && accountId)) {
        throw new Error('OMFG');
      }
      const position = positions.find((p) => p.accountId.eq(accountId));
      log('position', position);
      if (!position) {
        throw new Error('Position not found for account');
      }
      return position;
    },
  });
}
