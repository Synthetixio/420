import { renderAccountId } from '@_/format';
import {
  Alert,
  AlertDescription,
  AlertIcon,
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
import { ethers } from 'ethers';
import { useMemo, useState } from 'react';
import { useTransferAccountId } from './useTransferAccountId';

export function TransferOwnershipModal({
  isOpen,
  onClose,
  accountId,
  refetch,
  owner,
}: {
  isOpen: boolean;
  onClose: () => void;
  accountId: ethers.BigNumber;
  owner: string;
  refetch: () => void;
}) {
  const [to, setTo] = useState('');
  const { isPending, mutateAsync: submit } = useTransferAccountId(to, accountId);

  const isTargetValid = useMemo(
    () => ethers.utils.isAddress(to) && to.toLowerCase() !== owner.toLowerCase(),
    [owner, to]
  );
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent pb={1} borderRadius="md" bg="navy.700">
        <ModalHeader>Transfer Ownership</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Divider />
          <Text fontSize="18px" fontWeight={700} mt="4">
            Account {renderAccountId(accountId)}
          </Text>
          <Text fontSize="14px" color="white" mt="2">
            Will be transferred from:
          </Text>
          <Input mt="2" bg="navy.900" disabled value={owner} />
          <Text fontSize="14px" color="white" mt="2">
            Will be transferred to:
          </Text>
          <Input
            mt="2"
            bg="navy.900"
            onChange={(e) => {
              setTo(e.target.value.trim());
            }}
            value={to}
          />
        </ModalBody>
        <ModalFooter as={Flex} direction="column" gap={4} justifyContent="center">
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Flex direction="column">
              <AlertDescription>This action cannot be undone</AlertDescription>
            </Flex>
          </Alert>

          {isPending ? (
            <Spinner color="cyan" />
          ) : (
            <Button
              w="100%"
              onClick={() =>
                submit().then(() => {
                  setTo('');
                  refetch();
                  onClose();
                })
              }
              isDisabled={!isTargetValid}
            >
              Confirm
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
