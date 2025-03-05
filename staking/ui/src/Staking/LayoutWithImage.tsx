// import { LogoIcon } from '@_/icons';
// import { Circle, Flex, Image, Text } from '@chakra-ui/react';
import { Flex, Image } from '@chakra-ui/react';
import type React from 'react';

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
    <Flex
      direction="column"
      borderColor="gray.900"
      borderWidth="1px"
      borderRadius="6px"
      bg="navy.700"
    >
      <Flex direction="row" flexWrap="wrap" gap={4}>
        <Flex
          direction="column"
          flex={{ base: 2, sm: 2, md: 2, lg: 1 }}
          p={{ base: 4, sm: 10 }}
          pt={{ base: 6, sm: 10 }}
          gap={6}
        >
          <Flex direction="column" gap={4}>
            {/*
            <Flex alignItems="center" gap={3}>
              <Circle
                size="32px"
                bg="navy.900"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0px 0px 15px 0px rgba(0, 209, 255, 0.60)"
              >
                <LogoIcon width="20px" height="14px" />
              </Circle>
              <Text fontSize="12px" color="gray.500" fontWeight={500}>
                SNX 420 Pool
              </Text>
            </Flex>
            */}

            <Subheader />
          </Flex>

          <Flex
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="6px"
            p={{ base: 4, sm: 6 }}
            direction="column"
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
            rounded="5px"
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
