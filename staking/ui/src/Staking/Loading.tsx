import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';
import { LayoutWithImage } from './LayoutWithImage';
import { SubheaderMigrateAndEarn } from './SubheaderMigrateAndEarn';
import burn from './burn.webp';

export function Loading() {
  return (
    <LayoutWithImage
      imageSrc={burn}
      Subheader={() => <SubheaderMigrateAndEarn />}
      Content={() => (
        <Flex
          minHeight="10em"
          flex={1}
          direction="column"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" />
        </Flex>
      )}
    />
  );
}
