import { Flex } from '@chakra-ui/react';
import type React from 'react';

export function ContainerOuter({ ...props }) {
  return (
    <Flex
      direction="column"
      p={{ base: 4, sm: 10 }}
      gap={{ base: 6, sm: 10 }}
      borderRadius="base"
      bg="navy.700"
      {...props}
    />
  );
}
