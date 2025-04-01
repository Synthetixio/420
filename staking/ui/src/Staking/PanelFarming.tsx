import { Box, Image, Text } from '@chakra-ui/react';
import type React from 'react';
import farming from './farming.webp';

export function PanelFarming() {
  return (
    <>
      <Text fontSize="24px" fontWeight={500} lineHeight="32px" color="gray.50">
        SNX Powered Yield Farming
      </Text>
      <Text fontSize="16px" lineHeight="24px" color="gray.500">
        The 420 pool starts generating yield for you from Ethena and other yield sources
        immediately.
      </Text>
      <Box mt={2}>
        <Image borderRadius="base" src={farming} width="100%" height="100%" objectFit="cover" />
      </Box>
    </>
  );
}
