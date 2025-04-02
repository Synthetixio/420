import { ContractError } from '@_/ContractError';
import { useAccountProxy } from '@_/useAccountProxy';
import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import { useContractErrorParser } from '@_/useContractErrorParser';
import { usePool420Migrate } from '@_/usePool420Migrate';
import { useTreasuryMarketProxy } from '@_/useTreasuryMarketProxy';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';
import React from 'react';
import { useLiquidityPosition } from './useLiquidityPosition';
import { useTargetCRatio } from './useTargetCRatio';

const log = debug('snx:useMigrate420');

export function useMigratePool420({ accountId }: { accountId: ethers.BigNumber }) {
  const signer = useSigner();
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: liquidityPosition } = useLiquidityPosition({
    accountId,
  });

  const { data: Pool420Migrate } = usePool420Migrate();
  const { data: AccountProxy } = useAccountProxy();
  const { data: TrustedMulticallForwarder } = useTrustedMulticallForwarder();
  const { data: targetCRatio } = useTargetCRatio();
  const { data: TreasuryMarketProxy } = useTreasuryMarketProxy();

  const isReady =
    network &&
    provider &&
    signer &&
    TrustedMulticallForwarder &&
    Pool420Migrate &&
    AccountProxy &&
    TreasuryMarketProxy &&
    targetCRatio &&
    liquidityPosition &&
    liquidityPosition.collateral.gt(0) &&
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
      const Pool420MigrateInterface = new ethers.utils.Interface(Pool420Migrate.abi);
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
            Pool420Migrate.address,
            accountId,
          ]),
          requireSuccess: true,
        },
        {
          target: Pool420Migrate.address,
          callData: Pool420MigrateInterface.encodeFunctionData('migratePosition', [
            ethers.BigNumber.from(1), // SC Pool ID == 1
            accountId,
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
