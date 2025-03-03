import { CRatioAmount } from '@_/CRatioBar';
import { usePythPrice } from '@_/usePythPrice';
import { Flex, Text } from '@chakra-ui/react';
import { Wei, wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';

export function MigrateStats({
  collateralAmount,
  debt,
  cRatio,
}: {
  collateralAmount?: ethers.BigNumber | Wei;
  debt?: ethers.BigNumber | Wei;
  cRatio?: ethers.BigNumber | Wei;
}) {
  const { data: snxPrice } = usePythPrice('SNX');

  return (
    <Flex direction="column" gap={6}>
      <Text>Current Position</Text>
      <Flex gap={6} justifyContent="space-between">
        <Flex direction="column" gap={3} flex={1}>
          <Text color="gray.600" fontFamily="heading" fontSize="12px" lineHeight="16px" mr={1}>
            Deposited
          </Text>
          <Text>
            {collateralAmount
              ? `${numbro(wei(collateralAmount).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })} SNX`
              : '~'}
          </Text>
          <Text color="gray.500" fontFamily="heading" fontSize="0.75rem" lineHeight="1rem">
            {snxPrice && collateralAmount
              ? `$${numbro(wei(collateralAmount).mul(snxPrice).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })}`
              : '~'}
          </Text>
        </Flex>
        <Flex direction="column" gap={3} flex={1}>
          <Text color="gray.600" fontFamily="heading" fontSize="12px" lineHeight="16px" mr={1}>
            Debt
          </Text>
          <Text>
            {debt
              ? `🔥 $${numbro(wei(debt).toNumber()).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 2,
                  spaceSeparated: false,
                })}`
              : '~'}
          </Text>
        </Flex>
        <Flex direction="column" gap={3} flex={1}>
          <Text color="gray.600" fontFamily="heading" fontSize="12px" lineHeight="16px" mr={1}>
            C-Ratio
          </Text>
          {cRatio ? <CRatioAmount value={wei(cRatio).toNumber() * 100} /> : <Text>~</Text>}
        </Flex>
      </Flex>
    </Flex>
  );
}
