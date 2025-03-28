import { Flex, Heading } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';
import { Permissions } from './Permissions/Permissions';

export function AccountSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Synthetix Account Settings</title>
        <meta name="description" content="Synthetix Liquidity V3 - Account Settings" />
      </Helmet>
      <Flex direction="column" mb={16}>
        <Heading
          mt={{
            base: 2,
            sm: 8,
          }}
          mb={6}
          color="gray.50"
          fontSize="1.5rem"
          data-cy="account settings"
        >
          Account Settings
        </Heading>
        <Permissions />
      </Flex>
    </>
  );
}
