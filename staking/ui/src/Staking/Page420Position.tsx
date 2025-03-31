import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import numbro from 'numbro';
import React from 'react';
import { LayoutPositionWithImage } from './LayoutPositionWithImage';
import { PanelAccount } from './PanelAccount';
import { PanelTvl } from './PanelTvl';
import { SectionMigrateV2xPosition } from './SectionMigrateV2xPosition';
import { SectionMigrateV3Position } from './SectionMigrateV3Position';
import { SectionPool420Position } from './SectionPool420Position';
import { SectionWithdrawCollateral } from './SectionWithdrawCollateral';
import { SubheaderMigrateAndEarn } from './SubheaderMigrateAndEarn';
import smallBurn from './burn-small.webp';
import smallCoin from './coin-small.webp';
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
      {sorted420Positions.map((position) => (
        <SectionPool420Position
          key={`Pool 420 ${position.accountId.toString()}`}
          accountId={position.accountId}
        />
      ))}
      {v2xPosition?.debt.gt(0) ? (
        <LayoutPositionWithImage
          imageSrc={smallBurn}
          Subheader={() => (
            <Text color="gray.500" fontSize="md">
              Deposit now to fire up the burn and sleep easy.
            </Text>
          )}
          Content={() => (
            <>
              <Flex flex="2" bg="whiteAlpha.50" borderRadius="base" p={{ base: 4, sm: 6 }}>
                <SectionMigrateV2xPosition />
              </Flex>
            </>
          )}
        />
      ) : null}
      {sortedLiquidityPositions.map((position) => (
        <LayoutPositionWithImage
          key={`V3 Migrate ${position.accountId.toString()}`}
          imageSrc={smallBurn}
          Subheader={() => (
            <Text color="gray.500" fontSize="md">
              Deposit now to fire up the burn and sleep easy.
            </Text>
          )}
          Content={() => (
            <>
              <Flex
                direction="column"
                bg="whiteAlpha.50"
                borderRadius="base"
                p={{ base: 4, sm: 6 }}
                gap={6}
              >
                <SectionMigrateV3Position accountId={position.accountId} />
              </Flex>
              <PanelAccount accountId={position.accountId} />
            </>
          )}
        />
      ))}
      {sortedbBalances.map((balance) => (
        <LayoutPositionWithImage
          key={`Withdraw ${balance.accountId.toString()}`}
          imageSrc={smallCoin}
          Subheader={() => (
            <Text color="gray.500" fontSize="md">
              Your SNX has been unstaked.
            </Text>
          )}
          Content={() => (
            <>
              <Flex
                direction="column"
                bg="whiteAlpha.50"
                borderRadius="base"
                p={{ base: 4, sm: 6 }}
              >
                <SectionWithdrawCollateral accountId={balance.accountId} />
              </Flex>

              <PanelAccount accountId={balance.accountId} />
            </>
          )}
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
        borderRadius="base"
        p={{ base: 4, sm: 6 }}
        gap={1}
      >
        <Text fontSize="sm" color="gray.500">
          Total Deposited
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
        <Text fontSize="sm" color="gray.500">
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
          borderRadius="base"
          p={{ base: 4, sm: 6 }}
          gap={1}
        >
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

        <Flex
          direction="column"
          flex={1}
          bg="whiteAlpha.50"
          borderRadius="base"
          p={{ base: 4, sm: 6 }}
          gap={1}
        >
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
          borderRadius="base"
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
          borderRadius="base"
          p={{ base: 4, sm: 10 }}
        >
          <PanelTvl />
        </Flex>
      </Flex>

      <Heading color="gray.50" fontSize={['20px', '30px']} lineHeight="120%">
        Accounts
      </Heading>

      <Flex direction="column" gap={6}>
        <PositionsList />
      </Flex>
    </>
  );
}
