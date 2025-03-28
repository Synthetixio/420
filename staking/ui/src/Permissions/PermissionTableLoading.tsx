import { renderWalletAddress } from '@_/format';
import { Skeleton, Td, Text, Tr } from '@chakra-ui/react';
import { ethers } from 'ethers';

export function PermissionTableLoading() {
  return (
    <>
      <Tr>
        <Td py="4" width="200px">
          <Skeleton>
            <Text fontWeight={400} color="white" fontSize="16px">
              {renderWalletAddress(ethers.constants.AddressZero)}
            </Text>
          </Skeleton>
        </Td>
        <Td py="4">
          <Skeleton>-</Skeleton>
        </Td>
        <Td py="4">
          <Skeleton>-</Skeleton>
        </Td>
      </Tr>
      <Tr>
        <Td py="4" width="200px">
          <Skeleton>
            <Text fontWeight={400} color="white" fontSize="16px">
              {renderWalletAddress(ethers.constants.AddressZero)}
            </Text>
          </Skeleton>
        </Td>
        <Td py="4">
          <Skeleton>-</Skeleton>
        </Td>
        <Td py="4">
          <Skeleton>-</Skeleton>
        </Td>
      </Tr>
    </>
  );
}
