import { useNetwork } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import type { ethers } from 'ethers';
import { type LiquidityPosition, useLiquidityPositions } from './useLiquidityPositions';

const log = debug('snx:useLiquidityPosition');

export function useLiquidityPosition({ accountId }: { accountId: ethers.BigNumber }) {
  const { network } = useNetwork();
  const { data: liquidityPositions, dataUpdatedAt } = useLiquidityPositions();

  return useQuery<LiquidityPosition, Error>({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useLiquidityPosition',
      { accountId },
      { positions: dataUpdatedAt },
    ],
    enabled: Boolean(liquidityPositions && accountId),
    queryFn: async () => {
      if (!(liquidityPositions && accountId)) {
        throw new Error('OMFG');
      }
      log('accountId', accountId);
      const liquidityPosition = liquidityPositions.find((p) => p.accountId.eq(accountId));
      log('liquidityPosition', liquidityPosition);
      if (!liquidityPosition) {
        throw new Error('Liquidity position not found for account');
      }
      return liquidityPosition;
    },
  });
}
