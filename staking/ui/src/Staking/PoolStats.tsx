import { Flex, Text } from '@chakra-ui/react';
import numbro from 'numbro';
import React from 'react';
import { InfoBox } from './InfoBox';
import { useTvl } from './useTvl';

export function PoolStats() {
  const { data: tvl, isPending: isPendingTvl } = useTvl();
  return (
    <Flex direction="row" flexWrap="wrap" alignItems="center" gap={2}>
      <InfoBox>
        <Text>TVL</Text>
        <Text color="gray.50">
          {isPendingTvl
            ? '~'
            : tvl
              ? numbro(tvl).format({
                  trimMantissa: true,
                  thousandSeparated: true,
                  average: true,
                  mantissa: 1,
                  spaceSeparated: false,
                })
              : '-'}
        </Text>
      </InfoBox>
    </Flex>
  );
}
