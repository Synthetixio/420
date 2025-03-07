import { Flex } from '@chakra-ui/react';
import React from 'react';
import { ButtonConnect } from './ButtonConnect';
import { ButtonDocs } from './ButtonDocs';
import { ButtonGetSnx } from './ButtonGetSnx';
import { LayoutWithImage } from './LayoutWithImage';
import { SubheaderMigrateAndEarn } from './SubheaderMigrateAndEarn';
import burn from './burn.webp';

export function ConnectYourWallet() {
  return (
    <LayoutWithImage
      imageSrc={burn}
      Subheader={() => <SubheaderMigrateAndEarn />}
      Content={() => (
        <>
          <ButtonConnect />

          <Flex gap={4} justifyContent="space-between">
            <ButtonGetSnx />
            <ButtonDocs />
          </Flex>
        </>
      )}
    />
  );
}
