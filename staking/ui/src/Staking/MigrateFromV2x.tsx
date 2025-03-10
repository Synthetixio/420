import {
  Button,
  CloseButton,
  Divider,
  Flex,
  Heading,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { LayoutWithImage } from './LayoutWithImage';
import { MigrateStats } from './MigrateStats';
import { SubheaderMigrateAndEarn } from './SubheaderMigrateAndEarn';
import { ZeroRisk } from './ZeroRisk';
import burn from './burn.webp';
import coinburn from './coinburn.svg';
import { useMigrateNewPoolV2x } from './useMigrateNewPoolV2x';
import { useV2xPosition } from './useV2xPosition';

export function MigrateFromV2x() {
  const [isOpenMigrate, setIsOpenMigrate] = React.useState(false);
  const { isReady: isReadyMigrate } = useMigrateNewPoolV2x();
  const { data: v2xPosition } = useV2xPosition();
  const { isReady, mutation } = useMigrateNewPoolV2x();

  return (
    <>
      <Modal
        size="xl"
        isOpen={isOpenMigrate}
        onClose={() => setIsOpenMigrate(false)}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent
          mt="100px"
          borderWidth="1px"
          borderColor="gray.900"
          bg="navy.900"
          color="white"
        >
          <Flex justifyContent="space-between" p={6} alignItems="center">
            <Heading fontSize="28px">Deposit to the 420 Pool</Heading>
            <CloseButton onClick={() => setIsOpenMigrate(false)} color="gray" />
          </Flex>
          <Flex width="100%" px={6}>
            <Divider borderColor="gray.900" mb={6} colorScheme="gray" />
          </Flex>
          <ModalBody pt={0} pb={6}>
            <VStack spacing={2} align="start">
              <Flex gap={6}>
                <VStack gap={6} flex={1} align="start">
                  <Heading fontSize="20px">Your final burn is here!</Heading>
                  <Text>
                    Deposit now to have your debt forgiven over 12 months and avoid the risk of
                    liquidation.
                  </Text>
                  <Text>
                    <Link
                      isExternal
                      color="cyan.500"
                      href="https://blog.synthetix.io/420-stake-it/"
                    >
                      Learn more about the 420 Pool
                    </Link>
                  </Text>
                </VStack>
                <Flex alignItems="center" justifyContent="center">
                  <Image
                    mx={6}
                    width="150px"
                    src={coinburn}
                    alt="Synthetix Delegated Staking Launch"
                  />
                </Flex>
              </Flex>

              <Spacer mt={6} />

              <Button
                width="100%"
                isLoading={mutation.isPending}
                isDisabled={!(isReady && !mutation.isPending)}
                onClick={() => {
                  window?._paq?.push(['trackEvent', 'staking', 'submit', 'submit_burn_my_debt']);
                  mutation.mutateAsync();
                }}
              >
                Burn My Debt
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <LayoutWithImage
        imageSrc={burn}
        Subheader={() => <SubheaderMigrateAndEarn />}
        Content={() => (
          <>
            <MigrateStats
              debt={v2xPosition?.debt}
              collateralAmount={v2xPosition?.collateralAmount}
              cRatio={v2xPosition?.cRatio}
            />
            <ZeroRisk />
            <Button
              isDisabled={!isReadyMigrate}
              onClick={() => {
                window?._paq?.push(['trackEvent', 'staking', 'click', 'click_burn_my_debt']);
                setIsOpenMigrate(true);
              }}
            >
              Burn My Debt
            </Button>
          </>
        )}
      />
    </>
  );
}
