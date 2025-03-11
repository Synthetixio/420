import { XIcon } from '@_/icons';
import { CopyIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  Button,
  CloseButton,
  Flex,
  Heading,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React from 'react';
import Synthetix420 from './420.webp';

export function ModalShare420({
  isOpenShare,
  setIsOpenShare,
}: { isOpenShare: boolean; setIsOpenShare: (isOpen: boolean) => void }) {
  const toast = useToast();
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  return (
    <Modal
      size="xl"
      isOpen={isOpenShare}
      onClose={() => setIsOpenShare(false)}
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent mt="100px" borderWidth="1px" borderColor="gray.900" bg="navy.900" color="white">
        <Flex justifyContent="space-between" p={6} alignItems="center">
          <Heading fontSize="18px" lineHeight="28px">
            Share
          </Heading>
          <CloseButton onClick={() => setIsOpenShare(false)} color="gray" />
        </Flex>
        <ModalBody pt={0} pb={6}>
          <Flex direction="column" gap={6}>
            <Image
              width="100%"
              src={Synthetix420}
              alt="Synthetix Delegated Staking Launch"
              ref={imageRef}
              borderWidth="1px"
              borderColor="gray.900"
              borderStyle="solid"
              borderRadius="6px"
            />
            <Flex gap={2}>
              <Button
                variant="outline"
                borderColor="gray.900"
                color="gray.50"
                as={Link}
                textDecoration="none"
                _hover={{ textDecoration: 'none', backgroundColor: 'rgba(0, 209, 255, 0.12)' }}
                href={Synthetix420}
                download="SynthetixPool420.webp"
              >
                <DownloadIcon mr={2} />
                Download
              </Button>
              <Button
                variant="outline"
                borderColor="gray.900"
                color="gray.50"
                onClick={async () => {
                  try {
                    if (!imageRef.current) {
                      throw new Error('Failed to get image reference.');
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = imageRef.current.naturalWidth;
                    canvas.height = imageRef.current.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                      throw new Error('Failed to get canvas context.');
                    }
                    ctx.drawImage(imageRef.current, 0, 0);
                    const pngBlob = await new Promise<Blob | null>((resolve) =>
                      canvas.toBlob(resolve, 'image/png')
                    );
                    if (!pngBlob) {
                      throw new Error('Failed to convert canvas to PNG blob.');
                    }
                    await navigator.clipboard.write([
                      new ClipboardItem({
                        [pngBlob.type]: pngBlob,
                      }),
                    ]);
                    toast.closeAll();
                    toast({
                      title: 'Copied!',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                  } catch (error) {
                    console.error(error);
                    toast.closeAll();
                    toast({
                      title: 'Failed to copy.',
                      status: 'error',
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              >
                <CopyIcon mr={2} />
                Copy
              </Button>
              <Button
                variant="outline"
                borderColor="gray.900"
                color="gray.50"
                as={Link}
                textDecoration="none"
                _hover={{ textDecoration: 'none', backgroundColor: 'rgba(0, 209, 255, 0.12)' }}
                isExternal
                href="https://x.com/intent/post?text=The%20420%20Pool%20burned%20all%20my%20$SNX%20debt.%20I%20am%20safe.&url=https%3A%2F%2F420.synthetix.io"
              >
                Share on <XIcon w="24px" h="24px" ml={2} />
              </Button>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
