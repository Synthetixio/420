import { ArrowUpIcon } from '@chakra-ui/icons';
import { Button, Link, Text } from '@chakra-ui/react';
import React from 'react';

export function ButtonGetSnx({ ...props }) {
  return (
    <Button
      as={Link}
      isExternal
      href="https://app.uniswap.org/explore/tokens/ethereum/0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f"
      variant="trasparent"
      borderColor="gray.900"
      color="cyan.500"
      borderWidth="1px"
      width="100%"
      textDecoration="none"
      _hover={{ textDecoration: 'none' }}
      display="flex"
      gap={1}
      onClick={() => {
        window?._paq?.push(['trackEvent', 'staking', '420_migration', 'click_get_snx']);
      }}
      {...props}
    >
      <Text>Get SNX</Text>
      <ArrowUpIcon transform="rotate(45deg)" />
    </Button>
  );
}
