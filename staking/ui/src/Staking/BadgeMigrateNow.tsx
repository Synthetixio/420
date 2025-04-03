import { Text, type TextProps } from '@chakra-ui/react';

export function BadgeMigrateNow(props: TextProps) {
  return (
    <Text
      fontSize="xs"
      fontWeight={700}
      letterSpacing="wide"
      borderRadius="base"
      borderWidth="1px"
      borderColor="cyan.500"
      borderStyle="solid"
      textTransform="uppercase"
      whiteSpace="nowrap"
      py={0}
      px={1}
      height="fit-content"
      mt={1}
      bgGradient="linear(to-r, #34EDB3, #00D1FF)"
      bgClip="text"
      {...props}
    >
      Migrate Now
    </Text>
  );
}
