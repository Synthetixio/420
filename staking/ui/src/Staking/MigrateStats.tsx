import { usePythPrice } from '@_/usePythPrice';
import { Flex, Text } from '@chakra-ui/react';
import { type Wei, wei } from '@synthetixio/wei';
import type { ethers } from 'ethers';
import numbro from 'numbro';
import React from 'react';

function renderCRatio(rawValue?: Wei | ethers.BigNumber | number) {
  if (!rawValue) {
    return '~';
  }
  const value = wei(rawValue).toNumber();
  if (value <= 0) {
    return 'N/A';
  }
  if (value >= Number.MAX_SAFE_INTEGER) {
    return 'Infinite';
  }
  return `${Math.round(value * 100)}%`;
}

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
      <Text fontSize="1.25em" fontWeight={700}>
        Current Position
      </Text>
      <Flex gap={6} justifyContent="space-between" wrap="wrap">
        <Flex direction="column" gap={3} flex={1}>
          <Text color="gray.600" fontSize="12px">
            Deposited
          </Text>
          <Text fontSize="18px" fontWeight={500}>
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
          <Text color="gray.500" fontSize="0.75rem">
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
          <Text color="gray.600" fontSize="12px">
            Debt
          </Text>
          <Text fontSize="18px" fontWeight={500}>
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
          <Text color="gray.600" fontSize="12px">
            C-Ratio
          </Text>
          <Text fontSize="18px" fontWeight={500}>
            {renderCRatio(cRatio)}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}
