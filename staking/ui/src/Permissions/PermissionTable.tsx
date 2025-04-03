import { renderAccountId } from '@_/format';
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
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import type { ethers } from 'ethers';
import { useMemo } from 'react';
import { Address } from './Address';
import { PermissionModal } from './PermissionModal';
import { PermissionRow } from './PermissionRow';
import { PermissionTableLoading } from './PermissionTableLoading';
import { PermissionsInfo } from './PermissionsInfo';
import { TransferOwnershipModal } from './TransferOwnershipModal';
import { useAccountOwner, useAccountPermissions } from './useAccountPermissions';

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
      <TableContainer flexGrow="2" bg="navy.700" borderRadius="md" p={6}>
        <Flex mb={6} w="100%" justifyContent="space-between">
          <Heading size="md">Account {renderAccountId(accountId)}</Heading>
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

        <Table variant="unstyled">
          <Thead>
            <Tr>
              <Th textTransform="unset" color="gray.600" fontFamily="heading" fontSize="sm" pl={0}>
                Address
              </Th>
              <Th textTransform="unset" color="gray.600" fontFamily="heading" fontSize="sm">
                Permissions
                <PermissionsInfo />
              </Th>
              <Th
                textTransform="unset"
                color="gray.600"
                fontFamily="heading"
                fontSize="sm"
                pr={0}
              />
            </Tr>
          </Thead>

          <Tbody>
            <Tr>
              <Td width={240} pl={0}>
                <Skeleton isLoaded={!loadingOwner}>
                  {accountOwner && <Address address={accountOwner} />}
                </Skeleton>
              </Td>
              <Td>
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
              <Td textAlign="end" pr={0}>
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

            {isLoading ? (
              <PermissionTableLoading />
            ) : (
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
                ))
            )}
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
