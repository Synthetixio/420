import { useNetwork, useWallet } from '@_/useBlockchain';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { useBalances } from './useBalances';
import { useLiquidityPositions } from './useLiquidityPositions';
import { usePositions } from './usePositions';
import { useV2xPosition } from './useV2xPosition';

const log = debug('snx:useFlags');

export function useFlags() {
  const { activeWallet } = useWallet();
  const walletAddress = activeWallet?.address;
  const { network } = useNetwork();
  const { data: positions, dataUpdatedAt: tsPositions } = usePositions();
  const { data: balances, dataUpdatedAt: tsBalances } = useBalances();
  const { data: liquidityPositions, dataUpdatedAt: tsLiquidityPositions } = useLiquidityPositions();
  const { data: v2xPosition, dataUpdatedAt: tsV2xPosition } = useV2xPosition();
  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useFlags',
      { walletAddress },
      { tsPositions, tsBalances, tsLiquidityPositions, tsV2xPosition },
    ],
    enabled: Boolean(positions && balances && liquidityPositions && v2xPosition),
    queryFn: async () => {
      if (!(positions && balances && liquidityPositions && v2xPosition)) {
        throw new Error('OMFG');
      }

      const flags = {
        has420Position: positions.some((position) => position.loanStartTime.gt(0)),
        hasV2xPosition: v2xPosition.debt.gt(0),
        hasV3Position: liquidityPositions.some((liquidityPosition) =>
          liquidityPosition.collateral.gt(0)
        ),
        hasV3Debt: liquidityPositions.some((liquidityPosition) => liquidityPosition.debt.gt(0)),
        hasAvailableCollateral: balances.some((balance) => balance.collateralAvailable.gt(0)),
      };
      log('flags', flags);
      return flags;
    },
  });
}
