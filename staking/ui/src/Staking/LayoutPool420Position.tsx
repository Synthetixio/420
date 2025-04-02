import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Button, Collapse, Flex, Image, Text, useDisclosure } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { AccountId } from './AccountId';
import { BadgeMigrateNow } from './BadgeMigrateNow';
import { ModalShare420 } from './ModalShare420';
import { PanelPool420Position } from './PanelPool420Position';
import { PanelsPool420BurnChart } from './PanelsPool420BurnChart';
import share from './share.svg';
import { usePosition } from './usePosition';

function Subheader() {
  const [isOpenShare, setIsOpenShare] = React.useState(false);
  return (
    <>
      <Flex direction={{ base: 'column', sm: 'row' }} gap={4} justifyContent="space-between">
        <Text color="gray.500" maxWidth="40em" fontSize={['sm', 'md']}>
          Your position is fully delegated to Synthetix, and your debt is being forgiven
          automatically over time with zero risk of liquidation.
        </Text>
        <Button variant="outline" onClick={() => setIsOpenShare(true)} minWidth="fit-content">
          <Image mr={2} width="16px" src={share} alt="Share Synthetix 420 Pool" />
          Share
        </Button>
      </Flex>
      <ModalShare420 isOpenShare={isOpenShare} setIsOpenShare={setIsOpenShare} />
    </>
  );
}

export function LayoutPool420Position({
  accountId,
  index,
  defaultIsOpen,
}: {
  accountId: ethers.BigNumber;
  index: number;
  defaultIsOpen: boolean;
}) {
  const { data: position, isPending: isPendingPosition } = usePosition({ accountId });
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
            Migrated Account #{index}
          </Text>
          <Text
            color="gray.500"
            fontSize="sm"
            display={isOpen ? 'none' : 'flex'}
            transition="all 300ms"
            pointerEvents="none"
          >
            <AccountId accountId={accountId} />
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
            {isPendingPosition
              ? '~'
              : position
                ? `$${numbro(wei(position.loan).toNumber()).format({
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
            {isPendingPosition
              ? '~'
              : position
                ? `$${numbro(wei(position.burn).toNumber()).format({
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
            Account Balance
          </Text>
          <Text color="gray.50" fontSize="sm" fontWeight={500}>
            {isPendingPosition
              ? '~'
              : position
                ? `${numbro(wei(position.collateral).toNumber()).format({
                    trimMantissa: true,
                    thousandSeparated: true,
                    average: true,
                    mantissa: 2,
                    spaceSeparated: false,
                  })} SNX`
                : null}{' '}
            <Text as="span" color="gray.500" fontSize="sm" fontWeight={500}>
              {isPendingPosition
                ? '~'
                : position
                  ? `$${numbro(
                      wei(position.collateral).mul(position.collateralPrice).toNumber()
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
          gap={6}
          flex={0}
          position={{ base: 'absolute', lg: 'static' }}
          top={0}
          right={0}
        >
          <BadgeMigrateNow opacity={0} />
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
          <Subheader />

          <Flex direction={{ base: 'column', lg: 'row' }} flexWrap="wrap" gap={6}>
            <Flex flex="2" direction="column" gap={6} order={{ base: 2, lg: 1 }}>
              <PanelsPool420BurnChart accountId={accountId} />
            </Flex>

            <Flex direction="column" flex="1" overflow="hidden" order={{ base: 1, lg: 2 }}>
              <PanelPool420Position accountId={accountId} />
            </Flex>
          </Flex>
        </Flex>
      </Collapse>
    </Box>
  );
}
