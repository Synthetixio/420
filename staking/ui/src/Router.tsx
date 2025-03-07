import { useParams } from '@_/useParams';
import { Container, Flex, Heading } from '@chakra-ui/react';
import { AccountSettingsPage } from './AccountSettingsPage';
import { DashboardPage } from './DashboardPage';
import { Footer } from './Footer';
import Header from './Header';
import { TestPage } from './TestPage';

function Content() {
  const [params] = useParams();

  // Combine all pages in one
  if (params.showAll) {
    let p = 1;
    return (
      <>
        <Heading fontSize="3em" mt={16} color="yellow.500">
          Page {p++}: Dashboard
        </Heading>
        <DashboardPage />
        <Heading fontSize="3em" mt={16} color="yellow.500">
          Page {p++}: Account Settings
        </Heading>
        <AccountSettingsPage />
      </>
    );
  }

  if (params.page === 'settings') {
    return <AccountSettingsPage />;
  }
  if (params.page === 'test') {
    return <TestPage />;
  }
  return <DashboardPage />;
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
