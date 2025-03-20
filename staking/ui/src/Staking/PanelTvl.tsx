import { Box, Divider, Flex, Text } from '@chakra-ui/react';
import numbro from 'numbro';
import type React from 'react';
import { TvlChart } from './TvlChart';
import { useTvl420 } from './useTvl420';

export function PanelTvl() {
  const { data: tvl420 } = useTvl420({ networkName: 'cross', span: 'daily' });
  return (
    <Flex
      direction="column"
      flex={1}
      gap={4}
      borderColor="gray.900"
      borderWidth="1px"
      borderRadius="6px"
      bg="navy.700"
      p={{ base: 4, sm: 10 }}
    >
      <Flex display={{ base: 'flex', sm: 'none' }} direction="column" gap={4}>
        <Text fontSize="24px" fontWeight={500} lineHeight="32px" color="gray.50">
          SNX Powered Yield Farming
        </Text>
        <Text fontSize="16px" lineHeight="24px" color="gray.500">
          The 420 pool starts generating yield for you from Ethena and other yield sources
          immediately.
        </Text>
        <Divider borderColor="gray.900" my={{ base: '4' }} />
      </Flex>

      <Flex
        gap={4}
        direction="row"
        justifyContent="space-between"
        flexWrap="nowrap"
        alignItems="baseline"
      >
        <Text fontSize="24px" fontWeight={500} lineHeight="32px" color="gray.50">
          TVL
        </Text>
        <Text fontSize="18px" fontWeight={500} color="gray.50">
          {tvl420 && tvl420.length > 0
            ? `${numbro(tvl420[tvl420.length - 1].value).format({
                trimMantissa: true,
                thousandSeparated: true,
                mantissa: 0,
                spaceSeparated: false,
              })} SNX`
            : null}
        </Text>
      </Flex>
      <TvlChart data={tvl420} />
    </Flex>
  );
}
