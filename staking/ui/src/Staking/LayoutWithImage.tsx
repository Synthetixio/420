// import { LogoIcon } from '@_/icons';
// import { Circle, Flex, Image, Text } from '@chakra-ui/react';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import type React from 'react';
import { PanelTvl } from './PanelTvl';
import farming from './farming.webp';

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
            gap={{ base: 6, sm: 10 }}
            justifyContent="center"
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
              rounded="6px"
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

      <Flex direction="column">
        <Flex direction={{ base: 'column', sm: 'column', md: 'column', lg: 'row' }} gap={6}>
          <Flex
            direction="column"
            flex={1}
            gap={4}
            display={{ base: 'none', sm: 'flex' }}
            borderColor="gray.900"
            borderWidth="1px"
            borderRadius="6px"
            bg="navy.700"
            p={{ base: 4, sm: 10 }}
          >
            <Text fontSize="24px" fontWeight={500} lineHeight="32px" color="gray.50">
              SNX Powered Yield Farming
            </Text>
            <Text fontSize="16px" lineHeight="24px" color="gray.500">
              The 420 pool starts generating yield for you from Ethena and other yield sources
              immediately.
            </Text>
            <Box mt={2}>
              <Image rounded="6px" src={farming} width="100%" height="100%" objectFit="cover" />
            </Box>
          </Flex>
          <PanelTvl />
        </Flex>
      </Flex>
    </>
  );
}
