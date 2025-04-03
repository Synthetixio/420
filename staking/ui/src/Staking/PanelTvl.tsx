import { Divider, Flex, Text } from '@chakra-ui/react';
import numbro from 'numbro';
import type React from 'react';
import { TvlChart } from './TvlChart';
import { useTvl420 } from './useTvl420';

export function PanelTvl() {
  const { data: tvl420 } = useTvl420({ networkName: 'cross', span: 'daily' });
  return (
    <>
      <Flex display={{ base: 'flex', sm: 'none' }} direction="column" gap={4}>
        <Text
          fontSize={['xl', '2xl']}
          fontWeight={500}
          lineHeight="120%"
          color="gray.50"
          letterSpacing="tight"
        >
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
        <Text
          fontSize={['xl', '2xl']}
          fontWeight={500}
          lineHeight="120%"
          color="gray.50"
          letterSpacing="tight"
        >
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
    </>
  );
}
