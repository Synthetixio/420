import { useNetwork, useWallet } from '@_/useBlockchain';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { Alert, AlertIcon, Collapse, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { Page420Position } from './Staking/Page420Position';
import { PageChangeNetwork } from './Staking/PageChangeNetwork';
import { PageConnectYourWallet } from './Staking/PageConnectYourWallet';
import { PageEmptyPosition } from './Staking/PageEmptyPosition';
import { PageEmptyV3Debt } from './Staking/PageEmptyV3Debt';
import { PageLoading } from './Staking/PageLoading';
import { PageMigrateFromV2x } from './Staking/PageMigrateFromV2x';
import { PageMigrateFromV3 } from './Staking/PageMigrateFromV3';
import { PageWithdrawPosition } from './Staking/PageWithdrawPosition';
import { useFlags } from './Staking/useFlags';

function HeaderDeposit() {
  return (
    <Flex direction="column" gap={3}>
      <Heading color="gray.50" maxWidth="40rem" fontSize={['2rem', '3rem']} lineHeight="120%">
        Deposit
      </Heading>

      <Flex justifyContent="space-between" alignItems="center" gap={6} flexWrap="wrap">
        <Text color="gray.500" fontSize="1rem" lineHeight={6}>
          Deposit into the 420 Pool to start earning yield
        </Text>
      </Flex>
    </Flex>
  );
}

function Header420() {
  return (
    <Flex direction="column" gap={3}>
      <Heading color="gray.50" maxWidth="40rem" fontSize={['2rem', '3rem']} lineHeight="120%">
        420 Pool
      </Heading>

      <Flex justifyContent="space-between" alignItems="center" gap={6} flexWrap="wrap">
        <Text color="gray.500" fontSize="1rem" lineHeight={6}>
          Simple SNX staking for maximum yield
        </Text>
      </Flex>
    </Flex>
  );
}

function Page() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const { data: flags, isPending: isPendingFlags } = useFlags();

  if (
    // Wallet not connected, cannot show anything
    !activeWallet
  ) {
    return (
      <>
        <HeaderDeposit />
        <PageConnectYourWallet />
      </>
    );
  }

  if (
    // Wallet connected but chain is not correct
    activeWallet &&
    !network
  ) {
    return (
      <>
        <HeaderDeposit />
        <PageChangeNetwork />
      </>
    );
  }

  if (
    // Wallet connected, network is supported but data is loading
    isPendingFlags
  ) {
    return (
      <>
        <HeaderDeposit />
        <PageLoading />
      </>
    );
  }

  if (
    // Has 420 position, page will include all other scenarios
    flags?.has420Position
  ) {
    return (
      <>
        <Header420 />
        <Page420Position />
      </>
    );
  }

  if (
    // Has v2x position, MIGRATE NOW!
    flags?.hasV2xPosition
  ) {
    return (
      <>
        <HeaderDeposit />
        <PageMigrateFromV2x />
      </>
    );
  }

  if (
    // Has v3 position, but does not have any debt yet, new Simple Staking (coming soon!)
    flags?.hasV3Position &&
    !flags?.hasV3Debt
  ) {
    return (
      <>
        <HeaderDeposit />
        <PageEmptyV3Debt />
      </>
    );
  }

  if (
    // Has v3 position, and has debt, MIGRATE NOW!
    flags?.hasV3Position &&
    flags?.hasV3Debt
  ) {
    return (
      <>
        <HeaderDeposit />
        <PageMigrateFromV3 />
      </>
    );
  }

  if (
    // Has something to withdraw
    flags?.hasAvailableCollateral
  ) {
    return (
      <>
        <Header420 />
        <PageWithdrawPosition />
      </>
    );
  }

  // No position, no collateral to withdraw
  return (
    <>
      <HeaderDeposit />
      <PageEmptyPosition />
    </>
  );
}

function ShowAll() {
  let step = 1;
  return (
    <>
      <Heading mt={16} color="red.500">
        State {step++}. Loading
      </Heading>
      <HeaderDeposit />
      <PageLoading />

      <Heading mt={16} color="red.500">
        State {step++}. Not connected
      </Heading>
      <HeaderDeposit />
      <PageConnectYourWallet />

      <Heading mt={16} color="red.500">
        State {step++}. Connected wallet, wrong network
      </Heading>
      <HeaderDeposit />
      <PageChangeNetwork />

      <Heading mt={16} color="red.500">
        State {step++}. Connected wallet, no v2x/v3 positions
      </Heading>
      <HeaderDeposit />
      <PageEmptyPosition />

      <Heading mt={16} color="red.500">
        State {step++}. v3 position without debt
      </Heading>
      <HeaderDeposit />
      <PageEmptyV3Debt />

      <Heading mt={16} color="red.500">
        State {step++}. Migrate v2x position
      </Heading>
      <HeaderDeposit />
      <PageMigrateFromV2x />

      <Heading mt={16} color="red.500">
        State {step++}. Migrate v3 position
      </Heading>
      <HeaderDeposit />
      <PageMigrateFromV3 />

      <Heading mt={16} color="red.500">
        State {step++}. Pool 420 existing position
      </Heading>
      <Header420 />
      <Page420Position />

      <Heading mt={16} color="red.500">
        State {step++}. Pool 420 withdraw
      </Heading>
      <Header420 />
      <PageWithdrawPosition />
    </>
  );
}

export function DashboardPage() {
  const [params] = useParams<HomePageSchemaType>();
  const { data: flags } = useFlags();
  return (
    <>
      <Helmet>
        <title>Synthetix 420 Pool</title>
        <meta name="description" content="Synthetix 420 Pool" />
      </Helmet>
      <Flex pt={8} direction="column" mb={16} width="100%">
        <Collapse in={flags?.hasV2xPosition || flags?.hasV3Debt} animateOpacity unmountOnExit>
          <Alert status="warning" mb="6">
            <AlertIcon />
            <Text>
              From March 24th the liquidation ratio is being raised on legacy positions. Migrate to
              420 Pool immediately.
            </Text>
          </Alert>
        </Collapse>

        <Flex direction="column" mt={6} gap={6}>
          {params.showAll ? <ShowAll /> : <Page />}
        </Flex>
      </Flex>
    </>
  );
}
