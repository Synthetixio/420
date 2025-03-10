import { ArrowUpIcon } from '@chakra-ui/icons';
import { Button, Link, Text } from '@chakra-ui/react';
import React from 'react';

export function ButtonDocs({ ...props }) {
  return (
    <Button
      as={Link}
      isExternal
      href="https://blog.synthetix.io/420-stake-it/"
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
        window?._paq?._paq.push(['trackEvent', 'staking', '420_migration', 'click_learn_more']);
      }}
      {...props}
    >
      <Text>Learn More</Text>
      <ArrowUpIcon transform="rotate(45deg)" />
    </Button>
  );
}
