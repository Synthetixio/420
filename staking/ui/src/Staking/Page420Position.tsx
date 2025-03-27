import { Box, Flex, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { PanelTvl } from './PanelTvl';
import { SectionPool420Position } from './SectionPool420Position';
import { usePositions } from './usePositions';
import { useTotals } from './useTotals';

import { SectionMigrateV2xPosition } from './SectionMigrateV2xPosition';
import { SectionMigrateV3Position } from './SectionMigrateV3Position';
import { SectionWithdrawCollateral } from './SectionWithdrawCollateral';
import { useBalance } from './useBalance';
import { useBalances } from './useBalances';
import { useLiquidityPosition } from './useLiquidityPosition';
import { useLiquidityPositions } from './useLiquidityPositions';
import { usePosition } from './usePosition';
import { useV2xPosition } from './useV2xPosition';

function PositionsList() {
  const { data: positions } = usePositions();
  const sorted420Positions = React.useMemo(() => {
    if (!positions) {
      return [];
    }
    return positions
      .filter((position) => position.collateral.gt(0))
      .sort((position1, position2) => (position1.collateral.gt(position2.collateral) ? -1 : 1))
      .sort((position1, position2) => (position1.loan.gt(position2.loan) ? -1 : 1));
  }, [positions]);

  const { data: liquidityPositions } = useLiquidityPositions();
  const sortedLiquidityPositions = React.useMemo(() => {
    if (!liquidityPositions) {
      return [];
    }
    return liquidityPositions
      .filter((liquidityPosition) => liquidityPosition.collateral.gt(0))
      .sort((position1, position2) => (position1.collateral.gt(position2.collateral) ? -1 : 1));
  }, [liquidityPositions]);

  const { data: balances } = useBalances();
  const sortedbBalances = React.useMemo(() => {
    if (!balances) {
      return [];
    }
    return balances
      .filter((balance) => balance.collateralAvailable.gt(0))
      .sort((position1, position2) =>
        position1.collateralAvailable
          .add(position1.collateralLocked)
          .gt(position2.collateralAvailable.add(position2.collateralLocked))
          ? -1
          : 1
      );
  }, [balances]);

  const { data: v2xPosition } = useV2xPosition();

  return (
    <Flex direction="column" gap={10}>
      {sorted420Positions.map((position) => (
        <SectionPool420Position
          key={`Pool 420 ${position.accountId.toString()}`}
          accountId={position.accountId}
        />
      ))}
      {v2xPosition?.debt.gt(0) ? (
        <Flex
          direction="column"
          backgroundColor="whiteAlpha.50"
          rounded="base"
          p={{ base: 4, sm: 10 }}
          gap={6}
        >
          <SectionMigrateV2xPosition />
        </Flex>
      ) : null}
      {sortedLiquidityPositions.map((position) => (
        <Flex
          direction="column"
          backgroundColor="whiteAlpha.50"
          rounded="base"
          key={`V3 Migrate ${position.accountId.toString()}`}
          p={{ base: 4, sm: 10 }}
          gap={6}
        >
          <SectionMigrateV3Position accountId={position.accountId} />
        </Flex>
      ))}
      {sortedbBalances.map((balance) => (
        <Flex
          direction="column"
          backgroundColor="whiteAlpha.50"
          rounded="base"
          key={`Withdraw ${balance.accountId.toString()}`}
          p={{ base: 4, sm: 10 }}
          gap={6}
        >
          <SectionWithdrawCollateral accountId={balance.accountId} />
        </Flex>
      ))}
    </Flex>
  );
}

export function Page420Position() {
  const { data: totals, isPending: isPendingTotals } = useTotals();
  return (
    <>
      <Flex direction="column">
        <Flex direction={{ base: 'column', sm: 'column', md: 'column', lg: 'row' }} gap={6}>
          <Flex
            direction={{ base: 'column', sm: 'column', md: 'column', lg: 'row' }}
            flexWrap="wrap"
            flex={1}
            gap={6}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="base"
            bg="navy.700"
            p={{ base: 4, sm: 10 }}
            alignContent="flex-start"
          >
            <Text fontSize="24px" fontWeight={500} lineHeight="32px" color="gray.50" width="100%">
              420 Pool Balance
            </Text>

            <Flex direction="column" gap={1} flex={1}>
              <Text fontSize="sm" color="gray.500">
                Deposited
              </Text>
              <Text fontSize="lg" color="gray.50">
                {isPendingTotals
                  ? '~'
                  : totals
                    ? `${numbro(wei(totals.deposit).toNumber()).format({
                        trimMantissa: true,
                        thousandSeparated: true,
                        average: true,
                        mantissa: 2,
                        spaceSeparated: false,
                      })} SNX`
                    : null}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {isPendingTotals
                  ? '~'
                  : totals
                    ? `$${numbro(wei(totals.deposit).mul(totals.collateralPrice).toNumber()).format(
                        {
                          trimMantissa: true,
                          thousandSeparated: true,
                          average: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        }
                      )}`
                    : null}
              </Text>
            </Flex>

            <Flex direction="column" gap={1} flex={1}>
              <Text fontSize="sm" color="gray.500">
                Current Debt
              </Text>
              <Text fontSize="lg" color="gray.50">
                {isPendingTotals
                  ? '~'
                  : totals
                    ? `$${numbro(wei(totals.loan).toNumber()).format({
                        trimMantissa: true,
                        thousandSeparated: true,
                        average: true,
                        mantissa: 2,
                        spaceSeparated: false,
                      })}`
                    : null}
              </Text>
            </Flex>

            <Box />

            <Flex direction="column" gap={1} flex={1}>
              <Text fontSize="sm" color="gray.500">
                Debt Burned
              </Text>
              <Text fontSize="lg" color="gray.50">
                {isPendingTotals
                  ? '~'
                  : totals
                    ? `$${numbro(wei(totals.burn).toNumber()).format({
                        trimMantissa: true,
                        thousandSeparated: true,
                        average: true,
                        mantissa: 2,
                        spaceSeparated: false,
                      })}`
                    : null}
              </Text>
            </Flex>
          </Flex>
          <PanelTvl />
        </Flex>
      </Flex>

      <Flex direction="column" gap={6}>
        <PositionsList />
      </Flex>
    </>
  );
}
