import { renderAccountId } from '@_/format';
import { Flex, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { BadgeMigrateNow } from './BadgeMigrateNow';
import { LayoutPositionSummary } from './LayoutPositionSummary';
import { PanelAccount } from './PanelAccount';
import { PanelWithdrawCollateral } from './PanelWithdrawCollateral';
import smallCoin from './coin-small.webp';
import { useBalance } from './useBalance';

export function LayoutWithdraw({
  accountId,
  index,
  defaultIsOpen,
}: {
  accountId: ethers.BigNumber;
  index: number;
  defaultIsOpen: boolean;
}) {
  const { data: balance, isPending: isPendingBalance } = useBalance({ accountId });
  return (
    <LayoutPositionSummary
      defaultIsOpen={defaultIsOpen}
      header={{
        c1: [`Migrated Account #${index}`, renderAccountId(accountId)],
        c2: ['Current Debt', '$0'],
        c3: ['Debt Burned', '-'],
        c4: [
          'Available to Withdraw',
          <>
            {isPendingBalance
              ? '~'
              : balance
                ? `${numbro(wei(balance.collateralAvailable).toNumber()).format({
                    trimMantissa: true,
                    thousandSeparated: true,
                    average: true,
                    mantissa: 2,
                    spaceSeparated: false,
                  })} SNX`
                : null}{' '}
            <Text key="$" as="span" color="gray.500" fontSize="sm" fontWeight={500}>
              {isPendingBalance
                ? '~'
                : balance
                  ? `$${numbro(
                      wei(balance.collateralAvailable).mul(balance.collateralPrice).toNumber()
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
      Badge={(props) => <BadgeMigrateNow opacity={0} {...props} />}
      Content={() => (
        <>
          <Text color="gray.500" fontSize="md">
            Your SNX has been unstaked.
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
                <PanelWithdrawCollateral accountId={accountId} />
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
                src={smallCoin}
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
