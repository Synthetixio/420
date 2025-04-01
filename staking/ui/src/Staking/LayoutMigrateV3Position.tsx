import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Collapse, Flex, Image, Text, useDisclosure } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { AccountId } from './AccountId';
import { BadgeMigrateNow } from './BadgeMigrateNow';
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
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen });
  return (
    <Box bg="navy.700" borderRadius="md" p={{ base: 4, sm: 10 }}>
      <Flex
        direction="row"
        justifyContent="space-between"
        onClick={onToggle}
        cursor="pointer"
        gap={6}
      >
        <Flex direction="column" gap={1}>
          <Text color="gray.50" fontSize="lg">
            Legacy Account #{index}
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
            {isPendingLiquidityPosition
              ? '~'
              : liquidityPosition
                ? `$${numbro(wei(liquidityPosition.debt).toNumber()).format({
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
            Account Balance
          </Text>
          <Text color="gray.50" fontSize="lg">
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
            <Text as="span" color="gray.500" fontSize="sm">
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
          </Text>
        </Flex>

        <Flex direction="row" textAlign="right" gap={6} flex={0}>
          <BadgeMigrateNow opacity={1} />
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
              display={{ base: 'none', sm: 'none', md: 'flex' }}
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
        </Flex>
      </Collapse>
    </Box>
  );
}
