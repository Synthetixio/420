import { Flex } from '@chakra-ui/react';
import type React from 'react';
import { PanelFarming } from './PanelFarming';
import { PanelTvl } from './PanelTvl';

export function PanelPromo() {
  return (
    <Flex direction="column">
      <Flex direction={{ base: 'column', sm: 'column', md: 'column', lg: 'row' }} gap={6}>
        <Flex
          direction="column"
          flex={1}
          gap={4}
          display={{ base: 'none', sm: 'flex' }}
          bg="navy.700"
          borderRadius="md"
          p={{ base: 4, sm: 10 }}
        >
          <PanelFarming />
        </Flex>
        <Flex
          direction="column"
          flex={1}
          gap={4}
          bg="navy.700"
          borderRadius="md"
          p={{ base: 4, sm: 10 }}
        >
          <PanelTvl />
        </Flex>
      </Flex>
    </Flex>
  );
}
