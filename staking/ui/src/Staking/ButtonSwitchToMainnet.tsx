import { MAINNET, useNetwork } from '@_/useBlockchain';
import { Button, Text } from '@chakra-ui/react';
import React from 'react';

export function ButtonSwitchToMainnet({ ...props }) {
  const { setNetwork } = useNetwork();
  return (
    <Button
      display="flex"
      alignItems="center"
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
      gap={1}
      onClick={() => setNetwork(MAINNET.id)}
      {...props}
    >
      <Text>Switch to Mainnet</Text>
    </Button>
  );
}
