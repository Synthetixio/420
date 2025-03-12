import { Address } from '@_/Address';
import { renderAccountId } from '@_/format';
import { useAccountOwner, useAccountPermissions } from '@_/useAccountPermissions';
import { useWallet } from '@_/useBlockchain';
import {
  Badge,
  Button,
  Flex,
  Heading,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import type { ethers } from 'ethers';
import { useMemo } from 'react';
import { PermissionModal } from './PermissionModal';
import { PermissionRow } from './PermissionRow';
import { PermissionTableLoading } from './PermissionTableLoading';
import { PermissionsInfo } from './PermissionsInfo';
import { TransferOwnershipModal } from './TransferOwnershipModal';

export function PermissionTable({
  accountId,
  refetchAccounts,
}: {
  accountId: ethers.BigNumber;
  refetchAccounts: () => void;
}) {
  const {
    isOpen: isPermissionOpen,
    onClose: onPermissionClose,
    onOpen: onPermissionOpen,
  } = useDisclosure();
  const {
    isOpen: isTransferOpen,
    onClose: onTransferClose,
    onOpen: onTransferOpen,
  } = useDisclosure();

  const { activeWallet } = useWallet();
  const { data: permissions, isLoading, refetch } = useAccountPermissions(accountId);
  const {
    data: accountOwner,
    isLoading: loadingOwner,
    refetch: refetchAccountOwner,
  } = useAccountOwner(accountId);

  const isOwner = useMemo(
    () => !!(accountOwner && accountOwner?.toLowerCase() === activeWallet?.address.toLowerCase()),
    [accountOwner, activeWallet?.address]
  );
  return (
    <>
      <TableContainer
        flexGrow="2"
        borderColor="gray.900"
        borderWidth="1px"
        borderRadius="6px"
        p={6}
        sx={{
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
        bg="navy.700"
      >
        <Flex mb="2" w="100%" justifyContent="space-between">
          <Heading size="md" mb="1">
            Account {renderAccountId(accountId)}
          </Heading>
          {isOwner && (
            <Button
              size="xs"
              onClick={() => {
                onPermissionOpen();
              }}
            >
              + New Permission
            </Button>
          )}
        </Flex>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th
                py={5}
                textTransform="unset"
                color="gray.600"
                fontFamily="heading"
                fontSize="12px"
                lineHeight="16px"
                borderBottomColor="gray.900"
              >
                Address
              </Th>
              <Th
                py={5}
                textTransform="unset"
                color="gray.600"
                fontFamily="heading"
                fontSize="12px"
                lineHeight="16px"
                borderBottomColor="gray.900"
              >
                Permissions
                <PermissionsInfo />
              </Th>
              <Th
                py={5}
                textTransform="unset"
                color="gray.600"
                fontFamily="heading"
                fontSize="12px"
                lineHeight="16px"
                borderBottomColor="gray.900"
              />
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td width={240} py={5} borderBottomColor="gray.900">
                <Skeleton isLoaded={!loadingOwner}>
                  {accountOwner && (
                    <Address
                      address={accountOwner}
                      fontWeight={400}
                      color="white"
                      fontSize="16px"
                    />
                  )}
                </Skeleton>
              </Td>
              <Td py={5} borderBottomColor="gray.900">
                <Badge
                  color="cyan"
                  variant="outline"
                  bg="cyan.900"
                  size="sm"
                  textTransform="capitalize"
                >
                  OWNER
                </Badge>
              </Td>
              <Td py={5} borderBottomColor="gray.900" textAlign="end">
                {isOwner && (
                  <Button
                    size="xs"
                    variant="outline"
                    colorScheme="gray"
                    color="white"
                    onClick={() => {
                      onTransferOpen();
                    }}
                  >
                    Transfer Ownership
                  </Button>
                )}
              </Td>
            </Tr>

            {isLoading && <PermissionTableLoading />}

            {!isLoading &&
              permissions &&
              Object.keys(permissions)
                .filter((target) => permissions[target]?.length > 0)
                .map((target) => (
                  <PermissionRow
                    key={target}
                    address={target}
                    currentPermissions={permissions[target]}
                    accountId={accountId}
                    refetch={refetch}
                    isOwner={isOwner}
                  />
                ))}
          </Tbody>
        </Table>
      </TableContainer>

      <PermissionModal
        isOpen={isPermissionOpen}
        onClose={onPermissionClose}
        accountId={accountId}
        refetch={refetch}
      />
      {accountOwner ? (
        <TransferOwnershipModal
          isOpen={isTransferOpen}
          onClose={onTransferClose}
          accountId={accountId}
          owner={accountOwner}
          refetch={() => {
            refetch();
            refetchAccountOwner();
            refetchAccounts();
          }}
        />
      ) : null}
    </>
  );
}
