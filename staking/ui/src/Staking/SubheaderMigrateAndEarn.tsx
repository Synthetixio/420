import { Stack, Text } from '@chakra-ui/react';
import React from 'react';

export function SubheaderMigrateAndEarn() {
  return (
    <Stack gap={4}>
      <Text
        color="gray.50"
        fontSize={['30px', '36px']}
        fontWeight={500}
        lineHeight={1.25}
        letterSpacing="tight"
      >
        Welcome to your final burn.
      </Text>
      <Text
        color="gray.300"
        fontSize={['20px', '24px']}
        fontWeight={500}
        lineHeight={1.25}
        letterSpacing="tight"
      >
        Deposit now to fire up the burn and sleep easy.
      </Text>
    </Stack>
  );
}
