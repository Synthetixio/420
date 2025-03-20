import { ContractError } from '@_/ContractError';
import { POOL_ID } from '@_/constants';
import { useAccountProxy } from '@_/useAccountProxy';
import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import { useCollateralType } from '@_/useCollateralTypes';
import { useContractErrorParser } from '@_/useContractErrorParser';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePositionManager420 } from '@_/usePositionManager420';
import { useTreasuryMarketProxy } from '@_/useTreasuryMarketProxy';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';
import React from 'react';
import { useTargetCRatio } from './useTargetCRatio';

const log = debug('snx:useMigrate420');

export function useMigratePool420() {
  const [params] = useParams<HomePageSchemaType>();

  const signer = useSigner();
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: collateralType } = useCollateralType('SNX');

  const { data: liquidityPosition } = useLiquidityPosition({
    accountId: params.accountId ? ethers.BigNumber.from(params.accountId) : undefined,
    collateralType,
  });

  const { data: PositionManager420 } = usePositionManager420();
  const { data: AccountProxy } = useAccountProxy();
  const { data: TrustedMulticallForwarder } = useTrustedMulticallForwarder();
  const { data: targetCRatio } = useTargetCRatio();
  const { data: TreasuryMarketProxy } = useTreasuryMarketProxy();

  const isReady =
    network &&
    provider &&
    signer &&
    TrustedMulticallForwarder &&
    PositionManager420 &&
    AccountProxy &&
    TreasuryMarketProxy &&
    targetCRatio &&
    liquidityPosition &&
    liquidityPosition.collateralAmount.gt(0) &&
    (liquidityPosition.cRatio.lte(0) || liquidityPosition.cRatio.gte(targetCRatio)) &&
    true;

  const toast = useToast({ isClosable: true, duration: 60_000 });
  const errorParser = useContractErrorParser();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!isReady) {
        throw new Error('Not ready');
      }

      toast.closeAll();
      toast({ title: 'Migrating...', variant: 'left-accent' });

      const AccountProxyInterface = new ethers.utils.Interface(AccountProxy.abi);
      const PositionManager420Interface = new ethers.utils.Interface(PositionManager420.abi);
      const TreasuryMarketProxyInterface = new ethers.utils.Interface(TreasuryMarketProxy.abi);

      const multicall = [
        {
          target: TreasuryMarketProxy.address,
          callData: TreasuryMarketProxyInterface.encodeFunctionData('rebalance'),
          requireSuccess: true,
        },
        {
          target: AccountProxy.address,
          callData: AccountProxyInterface.encodeFunctionData('approve', [
            PositionManager420.address,
            ethers.BigNumber.from(params.accountId),
          ]),
          requireSuccess: true,
        },
        {
          target: PositionManager420.address,
          callData: PositionManager420Interface.encodeFunctionData('migratePosition', [
            ethers.BigNumber.from(POOL_ID),
            ethers.BigNumber.from(params.accountId),
          ]),
          requireSuccess: true,
        },
      ];
      log('multicall', multicall);

      const TrustedMulticallForwarderContract = new ethers.Contract(
        TrustedMulticallForwarder.address,
        TrustedMulticallForwarder.abi,
        signer
      );
      const populatedTxn =
        await TrustedMulticallForwarderContract.populateTransaction.aggregate3(multicall);
      const gasLimit = await provider.estimateGas(populatedTxn);
      log('gasLimit', gasLimit);
      const txn = await TrustedMulticallForwarderContract.aggregate3(multicall, {
        gasLimit: gasLimit.mul(15).div(10),
      });
      log('txn', txn);
      const receipt = await provider.waitForTransaction(txn.hash);
      log('receipt', receipt);

      return receipt;
    },

    onSuccess: async () => {
      const deployment = `${network?.id}-${network?.preset}`;
      await Promise.all(
        [
          //
          'Pool 420',
          //
          'Accounts',
          'LiquidityPosition',
          'LiquidityPositions',
          'AccountCollateralUnlockDate',
        ].map((key) => queryClient.invalidateQueries({ queryKey: [deployment, key] }))
      );

      toast.closeAll();
      toast({
        title: 'Success',
        description: 'Migration completed.',
        status: 'success',
        variant: 'left-accent',
      });
    },

    onError: (error) => {
      const contractError = errorParser(error);
      if (contractError) {
        console.error(new Error(contractError.name), contractError);
      }
      toast.closeAll();
      toast({
        title: 'Could not complete migration',
        description: contractError ? (
          <ContractError contractError={contractError} />
        ) : (
          'Please try again.'
        ),
        status: 'error',
        variant: 'left-accent',
        duration: 3_600_000,
      });
      throw Error('Migration failed', { cause: error });
    },
  });

  return {
    isReady,
    mutation,
  };
}
