import { Text } from '@chakra-ui/react';
import { Amount } from '@_/Amount';
import { StatsBox } from '@_/StatsBox';
import { useLiquidityPositions } from '@_/useLiquidityPositions';
import { useParams } from '@_/useParams';
import { wei } from '@synthetixio/wei';
import React from 'react';

export function StatsTotalLocked() {
  const [params] = useParams();

  const { data: liquidityPositions, isPending: isPendingLiquidityPositions } =
    useLiquidityPositions({
      accountId: params.accountId,
    });

  const totalLocked = React.useMemo(
    () =>
      liquidityPositions
        ? liquidityPositions.reduce(
            (result, liquidityPosition) =>
              result.add(liquidityPosition.collateralAmount.mul(liquidityPosition.collateralPrice)),
            wei(0)
          )
        : wei(0),
    [liquidityPositions]
  );

  return (
    <StatsBox
      title="My TVL"
      isLoading={!(!params.accountId || (params.accountId && !isPendingLiquidityPositions))}
      value={<Amount prefix="$" value={wei(totalLocked || '0')} />}
      label={
        <>
          <Text textAlign="left">All assets locked in Positions </Text>
        </>
      }
    />
  );
}
