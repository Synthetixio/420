import { renderAccountId } from '@_/format';
import { Flex, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { BadgeMigrateNow } from './BadgeMigrateNow';
import { LayoutPositionSummary } from './LayoutPositionSummary';
import { PanelAccount } from './PanelAccount';
import { PanelMigrateV3Position } from './PanelMigrateV3Position';
import smallBurn from './burn-small.webp';
import { useLiquidityPosition } from './useLiquidityPosition';

export function LayoutMigrateV3Position({
  accountId,
  index,
  defaultIsOpen,
}: {
  accountId: ethers.BigNumber;
  index: number;
  defaultIsOpen: boolean;
}) {
  const { data: liquidityPosition, isPending: isPendingLiquidityPosition } = useLiquidityPosition({
    accountId,
  });
  return (
    <LayoutPositionSummary
      defaultIsOpen={defaultIsOpen}
      header={{
        c1: [`Legacy Account #${index}`, renderAccountId(accountId)],
        c2: [
          'Current Debt',
          isPendingLiquidityPosition
            ? '~'
            : liquidityPosition
              ? `$${numbro(wei(liquidityPosition.debt).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })}`
              : null,
        ],
        c3: ['Debt Burned', '-'],
        c4: [
          'Account Balance',
          <>
            {isPendingLiquidityPosition
              ? '~'
              : liquidityPosition
                ? `${numbro(wei(liquidityPosition.collateral).toNumber()).format({
                    trimMantissa: true,
                    thousandSeparated: true,
                    average: true,
                    mantissa: 2,
                    spaceSeparated: false,
                  })} SNX`
                : null}{' '}
            <Text key="$" as="span" color="gray.500" fontSize="sm" fontWeight={500}>
              {isPendingLiquidityPosition
                ? '~'
                : liquidityPosition
                  ? `$${numbro(
                      wei(liquidityPosition.collateral)
                        .mul(liquidityPosition.collateralPrice)
                        .toNumber()
                    ).format({
                      trimMantissa: true,
                      thousandSeparated: true,
                      average: true,
                      mantissa: 2,
                      spaceSeparated: false,
                    })}`
                  : null}
            </Text>
          </>,
        ],
      }}
      Badge={(props) => <BadgeMigrateNow opacity={1} {...props} />}
      Content={() => (
        <>
          <Text color="gray.500" fontSize="md">
            Deposit now to fire up the burn and sleep easy.
          </Text>

          <Flex direction="row" flexWrap="wrap" gap={6}>
            <Flex flex="2" direction="column" gap={6}>
              <Flex
                direction="column"
                bg="whiteAlpha.50"
                borderRadius="md"
                p={{ base: 4, sm: 6 }}
                gap={6}
              >
                <PanelMigrateV3Position accountId={accountId} />
              </Flex>
              <PanelAccount accountId={accountId} />
            </Flex>

            <Flex
              direction="column"
              flex="1"
              display={{ base: 'none', sm: 'none', lg: 'flex' }}
              overflow="hidden"
            >
              <Image
                borderRadius="md"
                src={smallBurn}
                width="100%"
                height="100%"
                objectFit="cover"
                style={{
                  maskImage: 'linear-gradient(270deg, #000000 50%, rgba(0, 0, 0, 0) 100%)',
                }}
              />
            </Flex>
          </Flex>
        </>
      )}
    />
  );
}
