import {
  Badge,
  Button,
  Divider,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { type ethers, utils } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { permissionsList } from './AccountPermissions';
import { PermissionsInfo } from './PermissionsInfo';
import { useAccountOwner, useAccountPermissions } from './useAccountPermissions';
import { useManagePermissions } from './useManagePermissions';

export function PermissionModal({
  accountId,
  isOpen,
  onClose,
  refetch,
  existingPermissions,
  target,
}: {
  accountId: ethers.BigNumber;
  target?: string;
  existingPermissions?: string[];
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}) {
  const [address, setAddress] = useState(target || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    ...(existingPermissions || []),
  ]);
  const { mutateAsync: submit, isPending } = useManagePermissions({
    target: address,
    accountId,
    existing: existingPermissions || [],
    selected: selectedPermissions,
  });

  const { data: permissionData } = useAccountPermissions(accountId);
  const { data: accountOwner } = useAccountOwner(accountId);

  useEffect(() => {
    if (!isOpen) {
      setSelectedPermissions([...(existingPermissions || [])]);
    }
  }, [existingPermissions, isOpen]);

  const isAddressValid = useMemo(() => {
    return (
      utils.isAddress(address) &&
      accountOwner?.toLowerCase() !== address.toLowerCase() &&
      (!!target || (permissionData && !permissionData[address.toLowerCase()]))
    );
  }, [accountOwner, address, permissionData, target]);

  const isFormValid = useMemo(() => {
    return selectedPermissions.length > 0 && isAddressValid;
  }, [isAddressValid, selectedPermissions.length]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent py={2} borderRadius="md" bg="navy.700">
        <ModalHeader>{target ? 'Edit' : 'New'} Permission</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Divider />
          <Flex pt={6} direction="column" gap="5">
            {!target && (
              <>
                <Text fontWeight={600} fontSize="14px" color="white">
                  Address
                </Text>
                <Input
                  bg="navy.900"
                  onChange={(e) => {
                    setAddress(e.target.value.trim());
                  }}
                  value={address}
                  isInvalid={!isAddressValid && !!address}
                />
              </>
            )}
            <Text fontWeight={600} color="white" fontSize="14px">
              Select Permissions <PermissionsInfo />
            </Text>
            <Flex justifyContent="space-evenly">
              {permissionsList.map((permission) => {
                const isActive = selectedPermissions.includes(permission);
                return (
                  <Badge
                    onClick={() =>
                      setSelectedPermissions((state) => {
                        if (state.includes(permission)) {
                          return state.filter((s) => s !== permission);
                        }
                        return [...state, permission];
                      })
                    }
                    variant="outline"
                    key={permission}
                    color={isActive ? 'cyan' : 'gray'}
                    textTransform="capitalize"
                    cursor="pointer"
                    bg="gray.900"
                    colorScheme={isActive ? 'cyan' : 'gray'}
                  >
                    {permission}
                  </Badge>
                );
              })}
            </Flex>
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="center">
          {isPending ? (
            <Spinner color="cyan" />
          ) : (
            <Button
              w="100%"
              onClick={() => {
                submit().then(() => {
                  setAddress('');
                  setSelectedPermissions([]);
                  refetch();
                  onClose();
                });
              }}
              isDisabled={!isFormValid}
            >
              {target ? 'Update ' : 'Add new '} permissions
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
