import { Flex, Image } from '@chakra-ui/react';
import type React from 'react';

export function LayoutPositionWithImage({
  Subheader,
  Content,
  imageSrc,
}: {
  Subheader: () => React.ReactNode;
  Content: () => React.ReactNode;
  imageSrc: string;
}) {
  return (
    <Flex
      direction="column"
      flexWrap="wrap"
      p={{ base: 4, sm: 10 }}
      bg="navy.700"
      borderRadius="base"
      gap={6}
    >
      <Subheader />

      <Flex direction="row" flexWrap="wrap" gap={6}>
        <Flex flex="2" direction="column" gap={6}>
          <Content />
        </Flex>

        <Flex
          direction="column"
          flex="1"
          display={{ base: 'none', sm: 'none', md: 'flex' }}
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
  );
}
