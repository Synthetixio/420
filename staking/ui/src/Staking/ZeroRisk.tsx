import { InfoIcon } from '@chakra-ui/icons';
import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

export function ZeroRisk({ ...props }) {
  return (
    <Flex direction="row" {...props}>
      <Flex
        direction="row"
        color="gray.500"
        backgroundColor="whiteAlpha.200"
        borderRadius="6px"
        py={3}
        px={4}
        gap={3}
        alignItems="center"
        width="100%"
      >
        <InfoIcon />
        <Text>Your migrated positions will have zero risk of liquidation</Text>
      </Flex>
    </Flex>
  );
}
