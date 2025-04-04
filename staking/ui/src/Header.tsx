import { Container, Flex, Image, useDisclosure } from '@chakra-ui/react';
import { useEffect } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import { NetworkController } from './NetworkController';
import snxStakingIcon from './snx-staking.svg';

export default function Header() {
  const { onClose } = useDisclosure();
  const location = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to close if location changes for any reason
  useEffect(() => {
    onClose();
  }, [location, onClose]);

  return (
    <Flex bg="navy.700" mb="4" py="3" borderBottomWidth="1px" borderBottomColor="whiteAlpha.200">
      <Container maxW="1236px" as={Flex} justifyContent="space-between" alignItems="center">
        <Flex
          as={RouterLink}
          to="/"
          direction="row"
          justifyContent="start"
          alignItems="center"
          height="22px"
        >
          <Image src={snxStakingIcon} alt="Synthetix 420 Pool" />
        </Flex>
        <Flex gap={3} flexWrap="wrap-reverse" justifyContent="center" alignItems="center">
          <NetworkController />
        </Flex>
      </Container>
    </Flex>
  );
}
