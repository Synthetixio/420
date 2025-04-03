import { Flex, Heading, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import numbro from 'numbro';
import React from 'react';
import { LayoutMigrateV2xPosition } from './LayoutMigrateV2xPosition';
import { LayoutMigrateV3Position } from './LayoutMigrateV3Position';
import { LayoutPool420Position } from './LayoutPool420Position';
import { LayoutWithdraw } from './LayoutWithdraw';
import { PanelTvl } from './PanelTvl';
import { useBalances } from './useBalances';
import { useLiquidityPositions } from './useLiquidityPositions';
import { usePositions } from './usePositions';
import { useTotals } from './useTotals';
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
      {sorted420Positions.map((position, i) => (
        <LayoutPool420Position
          key={`Pool 420 ${position.accountId.toString()}`}
          accountId={position.accountId}
          index={i + 1}
          defaultIsOpen={i === 0}
        />
      ))}
      {sortedbBalances.map((balance, i) => (
        <LayoutWithdraw
          key={`Withdraw ${balance.accountId.toString()}`}
          accountId={balance.accountId}
          index={sorted420Positions.length + i + 1}
          defaultIsOpen={sorted420Positions.length === 0 && i === 0}
        />
      ))}
      {v2xPosition?.debt.gt(0) ? (
        <LayoutMigrateV2xPosition
          index={1}
          defaultIsOpen={sorted420Positions.length === 0 && sortedbBalances.length === 0}
        />
      ) : null}
      {sortedLiquidityPositions.map((position, i) => (
        <LayoutMigrateV3Position
          key={`V3 Migrate ${position.accountId.toString()}`}
          accountId={position.accountId}
          index={i + 1 + (v2xPosition?.debt.gt(0) ? 1 : 0)}
          defaultIsOpen={
            sorted420Positions.length === 0 &&
            sortedbBalances.length === 0 &&
            (v2xPosition?.debt.gt(0) ? false : i === 0)
          }
        />
      ))}
    </Flex>
  );
}

function Totals() {
  const { data: totals, isPending: isPendingTotals } = useTotals();
  return (
    <>
      <Flex
        direction="column"
        flex={1}
        width="100%"
        textAlign="center"
        alignItems="center"
        bg="whiteAlpha.50"
        borderRadius="md"
        p={{ base: 4, sm: 6 }}
        gap={1}
      >
        <Text fontSize="sm" color="gray.500">
          Total Deposited
        </Text>
        <Text fontSize="lg" color="gray.50" fontWeight={500}>
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
        <Text fontSize="sm" color="gray.500" fontWeight={500}>
          {isPendingTotals
            ? '~'
            : totals
              ? `$${numbro(wei(totals.deposit).mul(totals.collateralPrice).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })}`
              : null}
        </Text>
      </Flex>

      <Flex
        direction="row"
        flexWrap="wrap"
        flex={1}
        alignContent="flex-start"
        textAlign="center"
        alignItems="center"
        gap={6}
      >
        <Flex
          direction="column"
          flex={1}
          bg="whiteAlpha.50"
          borderRadius="md"
          p={{ base: 4, sm: 6 }}
          gap={1}
        >
          <Text fontSize="sm" color="gray.500">
            Current Debt
          </Text>
          <Text fontSize="lg" color="gray.50" fontWeight={500}>
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

        <Flex
          direction="column"
          flex={1}
          bg="whiteAlpha.50"
          borderRadius="md"
          p={{ base: 4, sm: 6 }}
          gap={1}
        >
          <Text fontSize="sm" color="gray.500">
            Debt Burned
          </Text>
          <Text fontSize="lg" color="gray.50" fontWeight={500}>
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
    </>
  );
}

export function Page420Position() {
  return (
    <>
      <Flex direction={{ base: 'column', sm: 'column', md: 'column', lg: 'row' }} gap={6}>
        <Flex
          direction="column"
          flex={1}
          gap={6}
          bg="navy.700"
          borderRadius="md"
          p={{ base: 4, sm: 10 }}
          alignContent="flex-start"
        >
          <Totals />
        </Flex>
        <Flex
          direction="column"
          flex={1}
          gap={4}
          bg="navy.700"
          borderRadius="md"
          p={{ base: 4, sm: 10 }}
        >
          <PanelTvl />
        </Flex>
      </Flex>

      <Heading
        color="gray.50"
        fontSize="3xl"
        lineHeight="120%"
        letterSpacing="tight"
        fontWeight={500}
        mt={10}
      >
        Accounts
      </Heading>

      <Flex direction="column" gap={6}>
        <PositionsList />
      </Flex>
    </>
  );
}
