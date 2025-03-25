import { useNetwork, useWallet } from '@_/useBlockchain';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { Alert, AlertIcon, Collapse, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { Helmet } from 'react-helmet';
import { ChangeNetwork } from './Staking/ChangeNetwork';
import { ConnectYourWallet } from './Staking/ConnectYourWallet';
import { EmptyPosition } from './Staking/EmptyPosition';
import { EmptyV3Debt } from './Staking/EmptyV3Debt';
import { Loading } from './Staking/Loading';
import { MigrateFromV2x } from './Staking/MigrateFromV2x';
import { MigrateFromV3 } from './Staking/MigrateFromV3';
import { StakingPosition } from './Staking/StakingPosition';
import { WithdrawPosition } from './Staking/WithdrawPosition';
import { useBalances } from './Staking/useBalances';
import { useLiquidityPositions } from './Staking/useLiquidityPositions';
import { usePositions } from './Staking/usePositions';
import { useV2xPosition } from './Staking/useV2xPosition';

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

export function DashboardPage() {
  const [params] = useParams<HomePageSchemaType>();
  const { data: balances, isPending: isPendingBalances } = useBalances();
  const { data: positions, isPending: isPendingPositions } = usePositions();
  const { data: liquidityPositions, isPending: isPendingLiquidityPositions } =
    useLiquidityPositions();
  const { data: v2xPosition, isPending: isPendingV2xPosition } = useV2xPosition();
  const { activeWallet } = useWallet();
  const { network } = useNetwork();

  const isPending =
    activeWallet &&
    network &&
    (isPendingPositions ||
      isPendingBalances ||
      isPendingLiquidityPositions ||
      isPendingV2xPosition);

  const hasV2xPosition = v2xPosition?.debt.gt(0);
  const hasV3Position = liquidityPositions?.some((liquidityPosition) =>
    liquidityPosition.collateralAmount.gt(0)
  );
  const hasV3Debt = liquidityPositions?.some((liquidityPosition) =>
    liquidityPosition.debtAmount.gt(0)
  );
  const hasAvailableCollateral = balances?.some((balance) => balance.collateralAvailable.gt(0));

  // Only show 420 position even if user has other v3 positions on the same account
  const hasStakingPosition = positions?.some((position) => position.collateralAmount.gt(0));

  let step = 1;
  return (
    <>
      <Helmet>
        <title>Synthetix 420 Pool</title>
        <meta name="description" content="Synthetix 420 Pool" />
      </Helmet>
      <Flex pt={8} direction="column" mb={16} width="100%">
        <Collapse in={hasV2xPosition || hasV3Debt} animateOpacity unmountOnExit>
          <Alert status="warning" mb="6">
            <AlertIcon />
            <Text>
              From March 24th the liquidation ratio is being raised on legacy positions. Migrate to
              420 Pool immediately.
            </Text>
          </Alert>
        </Collapse>

        <Flex direction="column" mt={6} gap={6}>
          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Loading
            </Heading>
          ) : null}
          {params.showAll || isPending ? (
            <>
              <HeaderDeposit />
              <Loading />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Not connected
            </Heading>
          ) : null}
          {params.showAll || !activeWallet ? (
            <>
              <HeaderDeposit />
              <ConnectYourWallet />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Connected wallet, wrong network
            </Heading>
          ) : null}
          {params.showAll || (activeWallet && !network) ? (
            <>
              <HeaderDeposit />
              <ChangeNetwork />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Connected wallet, no v2x/v3 positions
            </Heading>
          ) : null}
          {params.showAll ||
          (activeWallet &&
            network &&
            !isPending &&
            !hasV2xPosition &&
            !hasV3Position &&
            !hasStakingPosition &&
            !hasAvailableCollateral) ? (
            <>
              <HeaderDeposit />
              <EmptyPosition />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. v3 position without debt
            </Heading>
          ) : null}
          {params.showAll ||
          (activeWallet &&
            network &&
            !isPending &&
            hasV3Position &&
            !hasV3Debt &&
            !hasStakingPosition) ? (
            <>
              <HeaderDeposit />
              <EmptyV3Debt />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Migrate v2x position
            </Heading>
          ) : null}
          {params.showAll || (activeWallet && network && !isPending && hasV2xPosition) ? (
            <>
              <HeaderDeposit />
              <MigrateFromV2x />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Migrate v3 position
            </Heading>
          ) : null}
          {params.showAll ||
          (activeWallet &&
            network &&
            !isPending &&
            hasV3Position &&
            hasV3Debt &&
            // We cannot migrate account if there is already POL position on same account
            !hasStakingPosition) ? (
            <>
              <HeaderDeposit />
              <MigrateFromV3 />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Pool 420 existing position
            </Heading>
          ) : null}
          {params.showAll || (activeWallet && network && !isPending && hasStakingPosition) ? (
            <>
              <Header420 />
              <StakingPosition />
            </>
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Pool 420 existing position
            </Heading>
          ) : null}
          {params.showAll ||
          (activeWallet &&
            network &&
            !isPending &&
            !hasStakingPosition &&
            hasAvailableCollateral) ? (
            <>
              <Header420 />
              <WithdrawPosition />
            </>
          ) : null}
        </Flex>
      </Flex>
    </>
  );
}
