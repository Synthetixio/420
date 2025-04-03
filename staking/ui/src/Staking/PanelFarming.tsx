import { Box, Image, Text } from '@chakra-ui/react';
import type React from 'react';
import farming from './farming.webp';

export function PanelFarming() {
  return (
    <>
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
      <Box mt={2}>
        <Image borderRadius="md" src={farming} width="100%" height="100%" objectFit="cover" />
      </Box>
    </>
  );
}
