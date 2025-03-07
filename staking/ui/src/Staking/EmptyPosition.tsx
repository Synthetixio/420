import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { ButtonDocs } from './ButtonDocs';
import { ButtonGetSnx } from './ButtonGetSnx';
import { ButtonStake } from './ButtonStake';
import { LayoutWithImage } from './LayoutWithImage';
import coin from './coin.webp';

export function EmptyPosition() {
  return (
    <LayoutWithImage
      imageSrc={coin}
      Subheader={() => (
        <>
          <Text
            color="gray.50"
            fontSize={['30px', '36px']}
            fontWeight={500}
            lineHeight={1.25}
            letterSpacing="tight"
          >
            Debt-free staking coming soon.
          </Text>
        </>
      )}
      Content={() => (
        <>
          <Text color="gray.600">
            The 420 Pool is currently accepting deposits from active stakers. Get SNX now to prepare
            for debt-free SNX yield.
          </Text>

          <ButtonStake />

          <Flex gap={4} justifyContent="space-between">
            <ButtonGetSnx />
            <ButtonDocs />
          </Flex>
        </>
      )}
    />
  );
}
