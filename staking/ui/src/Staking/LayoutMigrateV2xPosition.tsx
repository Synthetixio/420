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
        direction={{ base: 'column', lg: 'row' }}
        justifyContent="space-between"
        onClick={onToggle}
        cursor="pointer"
        gap={{ base: '2', lg: '6' }}
        position="relative"
      >
        <Flex direction="column" gap={1} justifyContent="center">
          <Text color="gray.50" fontSize="lg" fontWeight={500}>
            Legacy Account #{index}
          </Text>
        </Flex>

        <Flex
          direction={{ base: 'row', lg: 'column' }}
          textAlign="right"
          gap={1}
          justifyContent={{ base: 'space-between', lg: 'center' }}
          alignItems={{ base: 'center', lg: 'flex-end' }}
          display={isOpen ? 'none' : 'flex'}
          transition="all 300ms"
          mt={{ base: '4', lg: '0' }}
        >
          <Text color="gray.500" fontSize="xs">
            Current Debt
          </Text>
          <Text color="gray.50" fontSize="sm" fontWeight={500}>
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
          direction={{ base: 'row', lg: 'column' }}
          textAlign="right"
          gap={1}
          justifyContent={{ base: 'space-between', lg: 'center' }}
          alignItems={{ base: 'center', lg: 'flex-end' }}
          display={isOpen ? 'none' : 'flex'}
          transition="all 300ms"
        >
          <Text color="gray.500" fontSize="xs">
            Debt Burned
          </Text>
          <Text color="gray.50" fontSize="sm" fontWeight={500}>
            -
          </Text>
        </Flex>

        <Flex
          direction={{ base: 'row', lg: 'column' }}
          textAlign="right"
          gap={1}
          justifyContent={{ base: 'space-between', lg: 'center' }}
          alignItems={{ base: 'center', lg: 'flex-end' }}
          display={isOpen ? 'none' : 'flex'}
          transition="all 300ms"
        >
          <Text color="gray.500" fontSize="xs">
            Account Balance
          </Text>
          <Text color="gray.50" fontSize="sm" fontWeight={500}>
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
            <Text as="span" color="gray.500" fontSize="sm" fontWeight={500}>
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

        <Flex
          direction="row"
          textAlign="right"
          gap={['3', '6']}
          flex={0}
          position={{ base: 'absolute', lg: 'static' }}
          top={0}
          right={0}
        >
          <BadgeMigrateNow opacity={1} />
          <ChevronDownIcon
            transform={isOpen ? 'rotate(-180deg)' : ''}
            transition="transform 300ms"
            w={6}
            h={6}
          />
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Flex direction="column" flexWrap="wrap" gap={6} mt={4}>
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
        </Flex>
      </Collapse>
    </Box>
  );
}
