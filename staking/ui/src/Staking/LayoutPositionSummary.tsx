import { ChevronDownIcon } from '@chakra-ui/icons';
import { Box, Collapse, Flex, Text, type TextProps, useDisclosure } from '@chakra-ui/react';
import type React from 'react';

export function LayoutPositionSummary({
  defaultIsOpen,
  header,
  Badge,
  Content,
}: {
  defaultIsOpen: boolean;
  header: {
    c1: [React.ReactNode, React.ReactNode];
    c2: [React.ReactNode, React.ReactNode];
    c3: [React.ReactNode, React.ReactNode];
    c4: [React.ReactNode, React.ReactNode];
  };
  Badge: (props: TextProps) => React.ReactNode;
  Content: () => React.ReactNode;
}) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen });
  return (
    <Box bg="navy.700" borderRadius="md" p={{ base: 4, sm: 10 }}>
      <Box display={{ base: 'none', lg: 'block' }}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          justifyContent="space-between"
          onClick={onToggle}
          cursor="pointer"
          gap="6"
          position="relative"
          // lineHeight="1.2em"
          // height={isOpen ? '1.2em' : 'calc(var(--chakra-space-1) + 2.4em)'}
          // transition="height 300ms"
        >
          <Flex direction="column" gap={1} justifyContent="center">
            <Text color="gray.50" fontSize="lg" fontWeight={500}>
              {header.c1[0]}
            </Text>
            <Text
              color="gray.500"
              fontSize="sm"
              opacity={isOpen ? 0 : 1}
              transition="opacity 300ms"
            >
              {header.c1[1]}
            </Text>
          </Flex>

          <Flex
            direction="column"
            textAlign="right"
            gap={1}
            justifyContent="center"
            alignItems="flex-end"
            opacity={isOpen ? 0 : 1}
            transition="opacity 300ms"
          >
            <Text color="gray.500" fontSize="xs">
              {header.c2[0]}
            </Text>
            <Text color="gray.50" fontSize="sm" fontWeight={500}>
              {header.c2[1]}
            </Text>
          </Flex>

          <Flex
            direction="column"
            textAlign="right"
            gap={1}
            justifyContent="center"
            alignItems="flex-end"
            opacity={isOpen ? 0 : 1}
            transition="opacity 300ms"
          >
            <Text color="gray.500" fontSize="xs">
              {header.c3[0]}
            </Text>
            <Text color="gray.50" fontSize="sm" fontWeight={500}>
              {header.c3[1]}
            </Text>
          </Flex>

          <Flex
            direction="column"
            textAlign="right"
            gap={1}
            justifyContent="center"
            alignItems="flex-end"
            opacity={isOpen ? 0 : 1}
            transition="opacity 300ms"
          >
            <Text color="gray.500" fontSize="xs">
              {header.c4[0]}
            </Text>
            <Text color="gray.50" fontSize="sm" fontWeight={500}>
              {header.c4[1]}
            </Text>
          </Flex>

          <Flex direction="row" textAlign="right" gap={6} flex={0}>
            <Badge />
            <ChevronDownIcon
              transform={isOpen ? 'rotate(-180deg)' : ''}
              transition="transform 300ms"
              w={6}
              h={6}
            />
          </Flex>
        </Flex>
      </Box>

      <Box display={{ base: 'block', lg: 'none' }}>
        <Flex
          direction="row"
          justifyContent="space-between"
          onClick={onToggle}
          cursor="pointer"
          gap="2"
          position="relative"
          pb={1}
        >
          <Flex direction="column" gap={1} justifyContent="center">
            <Text color="gray.50" fontSize="lg" fontWeight={500}>
              {header.c1[0]}
            </Text>
          </Flex>

          <Flex direction="row" textAlign="right" gap={6} flex={0} alignItems="center">
            <Badge display={{ base: 'none', sm: 'block' }} />
            <ChevronDownIcon
              transform={isOpen ? 'rotate(-180deg)' : ''}
              transition="transform 300ms"
              w={6}
              h={6}
            />
          </Flex>
        </Flex>

        <Flex direction="row" textAlign="right" pb={2}>
          <Badge display={{ base: 'block', sm: 'none' }} />
        </Flex>

        <Collapse
          in={!isOpen}
          animateOpacity
          transition={{ exit: { duration: 0.3 }, enter: { duration: 0.3 } }}
        >
          <Flex
            direction="column"
            justifyContent="space-between"
            onClick={onToggle}
            cursor="pointer"
            gap="2"
            position="relative"
            whiteSpace="nowrap"
          >
            <Flex direction="column" justifyContent="center" pb={2}>
              <Text color="gray.500" fontSize="sm">
                {header.c1[1]}
              </Text>
            </Flex>

            <Flex
              direction="row"
              gap={4}
              justifyContent={{ base: 'space-between', sm: 'flex-start' }}
              alignItems="center"
              flexWrap="wrap"
            >
              <Text color="gray.500" fontSize="xs">
                {header.c2[0]}
              </Text>
              <Text color="gray.50" fontSize="sm" fontWeight={500}>
                {header.c2[1]}
              </Text>
            </Flex>

            <Flex
              direction="row"
              gap={4}
              justifyContent={{ base: 'space-between', sm: 'flex-start' }}
              alignItems="center"
              flexWrap="wrap"
            >
              <Text color="gray.500" fontSize="xs">
                {header.c3[0]}
              </Text>
              <Text color="gray.50" fontSize="sm" fontWeight={500}>
                {header.c3[1]}
              </Text>
            </Flex>

            <Flex
              direction="row"
              gap={4}
              justifyContent={{ base: 'space-between', sm: 'flex-start' }}
              alignItems="center"
              flexWrap="wrap"
            >
              <Text color="gray.500" fontSize="xs">
                {header.c4[0]}
              </Text>
              <Text color="gray.50" fontSize="sm" fontWeight={500}>
                {header.c4[1]}
              </Text>
            </Flex>
          </Flex>
        </Collapse>
      </Box>

      <Collapse
        in={isOpen}
        animateOpacity
        transition={{ exit: { duration: 0.3 }, enter: { duration: 0.3 } }}
      >
        <Flex direction="column" flexWrap="wrap" gap={6}>
          <Content />
        </Flex>
      </Collapse>
    </Box>
  );
}
