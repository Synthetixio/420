import { useWallet } from '@_/useBlockchain';
import { Flex, Text } from '@chakra-ui/react';
import type { ethers } from 'ethers';
import React from 'react';
import { AccountId } from './AccountId';
import { WalletAddress } from './WalletAddress';

export function PanelAccount({ accountId }: { accountId: ethers.BigNumber }) {
  const { activeWallet } = useWallet();
  return (
    <Flex
      direction="column"
      bg="whiteAlpha.50"
      borderRadius="md"
      p={{ base: 4, sm: 6 }}
      gap={6}
      color="gray.500"
      fontSize="sm"
    >
      <Flex minWidth="120px" direction="column" gap={3}>
        <Flex
          direction="row"
          gap={1}
          flexWrap="wrap"
          alignContent="center"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text>Account number</Text>
          <AccountId accountId={accountId} />
        </Flex>
        {activeWallet ? (
          <Flex
            direction="row"
            gap={1}
            flexWrap="wrap"
            alignContent="center"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text>Address</Text>
            <WalletAddress address={activeWallet.address} ens={activeWallet.ens?.name} />
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
}
