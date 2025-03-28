import { Flex, Image } from '@chakra-ui/react';
import type React from 'react';
import { PanelPromo } from './PanelPromo';

export function LayoutWithImage({
  Subheader,
  Content,
  imageSrc,
}: {
  Subheader: () => React.ReactNode;
  Content: () => React.ReactNode;
  imageSrc: string;
}) {
  return (
    <>
      <Flex direction="column" borderRadius="base" bg="navy.700">
        <Flex direction="row" flexWrap="wrap" gap={4}>
          <Flex
            direction="column"
            flex={{ base: 2, sm: 2, md: 2, lg: 1 }}
            p={{ base: 4, sm: 10 }}
            pt={{ base: 6, sm: 10 }}
            gap={{ base: 6, sm: 10 }}
            justifyContent="center"
          >
            <Flex direction="column" gap={4}>
              <Subheader />
            </Flex>

            <Flex
              direction="column"
              bg="whiteAlpha.50"
              borderRadius="base"
              p={{ base: 4, sm: 6 }}
              gap={4}
            >
              <Content />
            </Flex>
          </Flex>
          <Flex
            flex={{ base: 0, sm: 0, md: 1 }}
            direction="column"
            display={{ base: 'none', sm: 'none', md: 'flex' }}
            position="relative"
            overflow="hidden"
          >
            <Image
              borderRadius="base"
              src={imageSrc}
              width="100%"
              height="100%"
              objectFit="cover"
              style={{
                maskImage: 'linear-gradient(270deg, #000000 50%, rgba(0, 0, 0, 0) 100%)',
              }}
            />
          </Flex>
        </Flex>
      </Flex>

      <PanelPromo />
    </>
  );
}
