import { Box, Flex, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { PanelTvl } from './PanelTvl';
import { SectionPool420Position } from './SectionPool420Position';
import { usePositions } from './usePositions';
import { useTotals } from './useTotals';

import { SectionMigrateV3Position } from './SectionMigrateV3Position';
import { SectionWithdrawCollateral } from './SectionWithdrawCollateral';
import { useBalance } from './useBalance';
import { useLiquidityPosition } from './useLiquidityPosition';
import { usePosition } from './usePosition';

function StakingPositionItem({ accountId }: { accountId: ethers.BigNumber }) {
  const { data: position } = usePosition({ accountId });
  const { data: liquidityPosition } = useLiquidityPosition({ accountId });
  const { data: balance } = useBalance({ accountId });
  if (position?.loan.gt(0)) {
    return <SectionPool420Position accountId={accountId} />;
  }
  if (liquidityPosition?.collateral.gt(0)) {
    return <SectionMigrateV3Position accountId={accountId} />;
  }
  if (balance?.collateralAvailable.gt(0)) {
    return <SectionWithdrawCollateral accountId={accountId} />;
  }
}

export function PagePool420Position() {
  const { data: totals, isPending: isPendingTotals } = useTotals();
  const { data: positions } = usePositions();
  const sortedPositions = React.useMemo(() => {
    if (!positions) {
      return [];
    }
    return positions
      .filter((position) => position.collateral.gt(0))
      .sort((position1, position2) =>
        position1.collateral
          .mul(position1.collateralPrice)
          .gt(position2.collateral.mul(position2.collateralPrice))
          ? -1
          : 1
      )
      .sort((position1, position2) => (position1.loan.gt(position2.loan) ? -1 : 1));
  }, [positions]);
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
        {sortedPositions.map((position) => (
          <StakingPositionItem key={position.accountId.toString()} accountId={position.accountId} />
        ))}
      </Flex>
    </>
  );
}
