import { useCollateralType } from '@_/useCollateralTypes';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { Flex, Image, Text, Tooltip } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { EscrowTable } from './EscrowTable';
import escrowed from './escrowed.svg';

export function EscrowedSNX() {
  const [params] = useParams<HomePageSchemaType>();
  const { data: collateralType } = useCollateralType('SNX');

  const accountId = params.accountId ? ethers.BigNumber.from(params.accountId) : undefined;

  const { data: liquidityPosition, isPending: isPendingLiquidityPosition } = useLiquidityPosition({
    accountId,
    collateralType,
  });

  return liquidityPosition?.totalLocked.gt(0) ? (
    <Tooltip
      closeDelay={500}
      openDelay={300}
      hasArrow={true}
      offset={[0, 10]}
      label={
        <Flex py={2} direction="column" gap={2.5}>
          <Text color="gray.500" fontWeight={400} textAlign="left">
            A portion of your SNX is still in escrow, and will be available to withdraw on the
            vesting date
          </Text>
          <EscrowTable />
        </Flex>
      }
    >
      <Flex
        py="1"
        px="2"
        backgroundColor="whiteAlpha.200"
        borderRadius="base"
        color="gray.50"
        gap={2}
        justifyContent="center"
        width="fit-content"
        cursor="default"
        fontSize="xs"
      >
        <Image width="1em" src={escrowed} alt="Escrowed" verticalAlign="baseline" />
        <Text as="span" color="gray.500">
          Escrowed{' '}
        </Text>
        <Text color="gray.50" fontSize="1.0em">
          {isPendingLiquidityPosition
            ? '~'
            : liquidityPosition
              ? `${numbro(wei(liquidityPosition.totalLocked).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })} SNX`
              : null}
        </Text>
      </Flex>
    </Tooltip>
  ) : null;
}
