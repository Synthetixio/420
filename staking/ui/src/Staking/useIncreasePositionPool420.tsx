import { ContractError } from '@_/ContractError';
import { useAccountProxy } from '@_/useAccountProxy';
import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import { useContractErrorParser } from '@_/useContractErrorParser';
import { usePool420Migrate } from '@_/usePool420Migrate';
import { useSNX } from '@_/useSNX';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';
import React from 'react';

const log = debug('snx:useIncreasePosition420');

export function useIncreasePositionPool420({ accountId }: { accountId: ethers.BigNumber }) {
  const signer = useSigner();
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: Pool420Migrate } = usePool420Migrate();
  const { data: AccountProxy } = useAccountProxy();
  const { data: TrustedMulticallForwarder } = useTrustedMulticallForwarder();
  const { data: SNX } = useSNX();

  const isReady =
    network &&
    provider &&
    signer &&
    TrustedMulticallForwarder &&
    Pool420Migrate &&
    AccountProxy &&
    SNX &&
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
      toast({ title: 'Approving SNX...', variant: 'left-accent' });

      const walletAddress = await signer.getAddress();

      const SNXContract = new ethers.Contract(SNX.address, SNX.abi, signer);
      const snxBalance = await SNXContract.balanceOf(walletAddress);
      const snxAppoveGasLimit = await SNXContract.estimateGas.approve(
        Pool420Migrate.address,
        snxBalance
      );
      await SNXContract.approve(Pool420Migrate.address, snxBalance, {
        gasLimit: snxAppoveGasLimit.mul(15).div(10),
      });

      toast.closeAll();
      toast({ title: 'Updating position...', variant: 'left-accent' });

      const AccountProxyInterface = new ethers.utils.Interface(AccountProxy.abi);
      const Pool420MigrateInterface = new ethers.utils.Interface(Pool420Migrate.abi);

      const multicall = [
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
          callData: Pool420MigrateInterface.encodeFunctionData('increasePosition', [
            accountId,
            ethers.constants.MaxUint256, // All-in
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
      queryClient.invalidateQueries({
        queryKey: [`${network?.id}-${network?.preset}`, 'Pool 420'],
      });

      toast.closeAll();
      toast({
        title: 'Success',
        description: 'Position updated.',
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
        title: 'Could not update position',
        description: contractError ? (
          <ContractError contractError={contractError} />
        ) : (
          'Please try again.'
        ),
        status: 'error',
        variant: 'left-accent',
        duration: 3_600_000,
      });
      throw Error('Update failed', { cause: error });
    },
  });

  return {
    isReady,
    mutation,
  };
}
