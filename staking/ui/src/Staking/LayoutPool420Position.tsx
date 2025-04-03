import { renderAccountId } from '@_/format';
import { Button, Flex, Image, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { BadgeMigrateNow } from './BadgeMigrateNow';
import { LayoutPositionSummary } from './LayoutPositionSummary';
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
  return (
    <LayoutPositionSummary
      defaultIsOpen={defaultIsOpen}
      header={{
        c1: [`Migrated Account #${index}`, renderAccountId(accountId)],
        c2: [
          'Current Debt',
          isPendingPosition
            ? '~'
            : position
              ? `$${numbro(wei(position.loan).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })}`
              : null,
        ],
        c3: [
          'Debt Burned',
          isPendingPosition
            ? '~'
            : position
              ? `$${numbro(wei(position.burn).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })}`
              : null,
        ],
        c4: [
          'Account Balance',
          <>
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
            <Text key="$" as="span" color="gray.500" fontSize="sm" fontWeight={500}>
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
          </>,
        ],
      }}
      Badge={(props) => <BadgeMigrateNow opacity={0} {...props} />}
      Content={() => (
        <>
          <Subheader />
          <Flex direction={{ base: 'column', lg: 'row' }} flexWrap="wrap" gap={6}>
            <Flex flex="2" direction="column" gap={6} order={{ base: 2, lg: 1 }}>
              <PanelsPool420BurnChart accountId={accountId} />
            </Flex>

            <Flex direction="column" flex="1" overflow="hidden" order={{ base: 1, lg: 2 }}>
              <PanelPool420Position accountId={accountId} />
            </Flex>
          </Flex>
        </>
      )}
    />
  );
}
