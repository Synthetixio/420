import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Collapse, Flex, Image, Text, useDisclosure } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { AccountId } from './AccountId';
import { BadgeMigrateNow } from './BadgeMigrateNow';
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
  const { data: balance, isPending: isPendingBalance } = useBalance({
    accountId,
  });
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen });
  return (
    <Box bg="navy.700" borderRadius="base" p={{ base: 4, sm: 10 }}>
      <Flex
        direction="row"
        justifyContent="space-between"
        onClick={onToggle}
        cursor="pointer"
        gap={6}
      >
        <Flex direction="column" gap={1}>
          <Text color="gray.50" fontSize="lg">
            Migrated Account #{index}
          </Text>
          <Text color="gray.500" fontSize="sm" opacity={isOpen ? 0 : 1} transition="opacity 100ms">
            <AccountId accountId={accountId} />
          </Text>
        </Flex>

        <Flex
          direction="column"
          textAlign="right"
          gap={1}
          opacity={isOpen ? 0 : 1}
          transition="opacity 100ms"
        >
          <Text color="gray.500" fontSize="sm">
            Current Debt
          </Text>
          <Text color="gray.50" fontSize="lg">
            $0
          </Text>
        </Flex>

        <Flex
          direction="column"
          textAlign="right"
          gap={1}
          opacity={isOpen ? 0 : 1}
          transition="opacity 100ms"
        >
          <Text color="gray.500" fontSize="sm">
            Debt Burned
          </Text>
          <Text color="gray.50" fontSize="lg">
            -
          </Text>
        </Flex>

        <Flex
          direction="column"
          textAlign="right"
          gap={1}
          opacity={isOpen ? 0 : 1}
          transition="opacity 100ms"
        >
          <Text color="gray.500" fontSize="sm">
            Available to Withdraw
          </Text>
          <Text color="gray.50" fontSize="lg">
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
            <Text as="span" color="gray.500" fontSize="sm">
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
          </Text>
        </Flex>

        <Flex direction="row" textAlign="right" gap={6} flex={0}>
          <BadgeMigrateNow opacity={0} />
          <ChevronDownIcon
            transform={isOpen ? 'rotate(-180deg)' : ''}
            transition="transform 100ms"
            w={6}
            h={6}
          />
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Flex direction="column" flexWrap="wrap" gap={6}>
          <Text color="gray.500" fontSize="md">
            Your SNX has been unstaked.
          </Text>

          <Flex direction="row" flexWrap="wrap" gap={6}>
            <Flex flex="2" direction="column" gap={6}>
              <Flex
                direction="column"
                bg="whiteAlpha.50"
                borderRadius="base"
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
              display={{ base: 'none', sm: 'none', md: 'flex' }}
              overflow="hidden"
            >
              <Image
                borderRadius="base"
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
        </Flex>
      </Collapse>
    </Box>
  );
}
