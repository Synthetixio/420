import { useNetwork, useWallet } from '@_/useBlockchain';
import { useCollateralType } from '@_/useCollateralTypes';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { Flex, Heading, Text } from '@chakra-ui/react';
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
import { usePositionCollateral as usePool420PositionCollateral } from './Staking/usePositionCollateral';
import { useV2xPosition } from './Staking/useV2xPosition';

export function DashboardPage() {
  const [params] = useParams<HomePageSchemaType>();
  const { data: collateralType, isPending: isPendingCollateralType } = useCollateralType('SNX');
  const { data: liquidityPosition, isPending: isPendingLiquidityPosition } = useLiquidityPosition({
    accountId: params.accountId,
    collateralType,
  });
  const { data: pool420PositionCollateral, isPending: isPendingPool420PositionCollateral } =
    usePool420PositionCollateral();
  const { data: v2xPosition, isPending: isPendingV2xPosition } = useV2xPosition();

  const { activeWallet } = useWallet();

  const { network } = useNetwork();

  const isPending =
    activeWallet &&
    network &&
    (isPendingCollateralType ||
      (params.accountId && isPendingLiquidityPosition) ||
      (params.accountId && isPendingPool420PositionCollateral) ||
      isPendingV2xPosition);
  const hasV2xPosition = v2xPosition?.debt.gt(0);
  const hasV3Position = liquidityPosition?.collateralAmount.gt(0);
  const hasV3Debt = liquidityPosition?.debt.gt(0);

  // Only show POL position even if user has other v3 positions on the same account
  const hasStakingPosition = pool420PositionCollateral?.gt(0);

  let step = 1;
  return (
    <>
      <Helmet>
        <title>Synthetix 420 Pool</title>
        <meta name="description" content="Synthetix 420 Pool" />
      </Helmet>
      <Flex pt={8} direction="column" mb={16} width="100%">
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
        <Flex direction="column" mt={6} gap={6}>
          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Loading
            </Heading>
          ) : null}
          {params.showAll || isPending ? <Loading /> : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Not connected
            </Heading>
          ) : null}
          {params.showAll || !activeWallet ? <ConnectYourWallet /> : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Connected wallet, wrong network
            </Heading>
          ) : null}
          {params.showAll || (activeWallet && !network) ? <ChangeNetwork /> : null}

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
            !hasStakingPosition) ? (
            <EmptyPosition />
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
            <EmptyV3Debt />
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Migrate v2x position
            </Heading>
          ) : null}
          {params.showAll || (activeWallet && network && !isPending && hasV2xPosition) ? (
            <MigrateFromV2x />
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
            <MigrateFromV3 />
          ) : null}

          {params.showAll ? (
            <Heading mt={16} color="red.500">
              State {step++}. Pool 420 existing position
            </Heading>
          ) : null}
          {params.showAll || (activeWallet && network && !isPending && hasStakingPosition) ? (
            <StakingPosition />
          ) : null}
        </Flex>
      </Flex>
    </>
  );
}
