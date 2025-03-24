import { useCollateralType } from '@_/useCollateralTypes';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { Flex, Text } from '@chakra-ui/react';
import { wei } from '@synthetixio/wei';
import { intlFormat } from 'date-fns';
import { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';
import { useLocks } from './useLocks';

export function EscrowTable() {
  const [params] = useParams<HomePageSchemaType>();
  const accountId = params.accountId ? ethers.BigNumber.from(params.accountId) : undefined;
  const { data: collateralType } = useCollateralType('SNX');
  const { data: locks, isPending } = useLocks({ accountId, collateralType });

  return isPending ? (
    <Flex gap={8} justifyContent="space-between">
      <Text>Vesting date: ~</Text>
      <Text fontWeight={700}>~ SNX</Text>
    </Flex>
  ) : (
    <>
      {locks?.map((lock) => (
        <Flex key={lock.lockExpirationTime.toString()} gap={8} justifyContent="space-between">
          <Text>
            {`Vesting date: ${intlFormat(new Date(lock.lockExpirationTime.toNumber() * 1000), {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}`}
          </Text>
          <Text fontWeight={700}>{`${numbro(wei(lock.amountD18).toNumber()).format({
            trimMantissa: true,
            thousandSeparated: true,
            average: true,
            mantissa: 2,
            spaceSeparated: false,
          })} SNX`}</Text>
        </Flex>
      ))}
    </>
  );
}
