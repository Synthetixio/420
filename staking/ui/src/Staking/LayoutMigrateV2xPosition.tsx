import { Flex, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import numbro from 'numbro';
import React from 'react';
import { BadgeMigrateNow } from './BadgeMigrateNow';
import { LayoutPositionSummary } from './LayoutPositionSummary';
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
  return (
    <LayoutPositionSummary
      defaultIsOpen={defaultIsOpen}
      header={{
        c1: [`Legacy Account #${index}`, null],
        c2: [
          'Current Debt',
          isPendingV2xPosition
            ? '~'
            : v2xPosition
              ? `$${numbro(wei(v2xPosition.debt).toNumber()).format({
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
            <Text key="$" as="span" color="gray.500" fontSize="sm" fontWeight={500}>
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
        </>
      )}
    />
  );
}
