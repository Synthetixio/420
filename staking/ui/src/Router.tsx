import { useParams } from '@_/useParams';
import { Container, Flex } from '@chakra-ui/react';
import { AccountSettingsPage } from './AccountSettingsPage';
import { DashboardPage } from './DashboardPage';
import { Footer } from './Footer';
import Header from './Header';
import { TestPage } from './TestPage';

function Content() {
  const [params] = useParams();

  return (
    <>
      {params.showAll || !params.page || params.page === 'home' ? <DashboardPage /> : null}
      {params.showAll || params.page === 'settings' ? <AccountSettingsPage /> : null}
      {!params.showAll && params.page === 'test' ? <TestPage /> : null}
    </>
  );
}

export function Router() {
  return (
    <Flex
      as="main"
      minHeight="100vh"
      color="rgba(255,255,255,0.85)"
      direction="column"
      bg="navy.900"
    >
      <Flex flex="1" direction="column">
        <Header />
        <Flex as={Container} direction="column" maxW="1236px" flex="1">
          <Content />
        </Flex>
        <Footer />
      </Flex>
    </Flex>
  );
}
