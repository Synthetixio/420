import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Collapse, Flex, Image, Text, useDisclosure } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import numbro from 'numbro';
import React from 'react';
import { BadgeMigrateNow } from './BadgeMigrateNow';
import { PanelMigrateV2xPosition } from './PanelMigrateV2xPosition';
import smallBurn from './burn-small.webp';
import { useV2xPosition } from './useV2xPosition';

export function LayoutMigrateV2xPosition({
  index,
  defaultIsOpen,
}: {
  index: number;
  defaultIsOpen: boolean;
}) {
  const { data: v2xPosition, isPending: isPendingV2xPosition } = useV2xPosition();
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
            {isPendingV2xPosition
              ? '~'
              : v2xPosition
                ? `$${numbro(wei(v2xPosition.debt).toNumber()).format({
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
            {isPendingV2xPosition
              ? '~'
              : v2xPosition
                ? `${numbro(wei(v2xPosition.collateral).toNumber()).format({
                    trimMantissa: true,
                    thousandSeparated: true,
                    average: true,
                    mantissa: 2,
                    spaceSeparated: false,
                  })} SNX`
                : null}{' '}
            <Text as="span" color="gray.500" fontSize="sm">
              {isPendingV2xPosition
                ? '~'
                : v2xPosition
                  ? `$${numbro(
                      wei(v2xPosition.collateral).mul(v2xPosition.collateralPrice).toNumber()
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
                <PanelMigrateV2xPosition />
              </Flex>
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
