import { Text, type TextProps } from '@chakra-ui/react';

export function BadgeMigrateNow(props: TextProps) {
  return (
    <Text
      color="cyan.500"
      fontSize="sm"
      borderRadius="md"
      borderWidth="1px"
      borderColor="cyan.500"
      borderStyle="solid"
      textTransform="uppercase"
      whiteSpace="nowrap"
      py={0}
      px={1}
      height="fit-content"
      {...props}
    >
      Migrate Now
    </Text>
  );
}
