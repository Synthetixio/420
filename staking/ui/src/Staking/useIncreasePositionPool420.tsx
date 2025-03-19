import { ContractError } from '@_/ContractError';
import { useAccountProxy } from '@_/useAccountProxy';
import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import { useContractErrorParser } from '@_/useContractErrorParser';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePositionManager420 } from '@_/usePositionManager420';
import { useSNX } from '@_/useSNX';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';
import React from 'react';

const log = debug('snx:useIncreasePosition420');

export function useIncreasePositionPool420() {
  const [params] = useParams<HomePageSchemaType>();

  const signer = useSigner();
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: PositionManager420 } = usePositionManager420();
  const { data: AccountProxy } = useAccountProxy();
  const { data: TrustedMulticallForwarder } = useTrustedMulticallForwarder();
  const { data: SNX } = useSNX();

  const isReady =
    network &&
    provider &&
    signer &&
    TrustedMulticallForwarder &&
    PositionManager420 &&
    AccountProxy &&
    SNX &&
    true;

  const toast = useToast({ isClosable: true, duration: 9000 });
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
        PositionManager420.address,
        snxBalance
      );
      await SNXContract.approve(PositionManager420.address, snxBalance, {
        gasLimit: snxAppoveGasLimit.mul(15).div(10),
      });

      toast.closeAll();
      toast({ title: 'Updating position...', variant: 'left-accent' });

      const AccountProxyInterface = new ethers.utils.Interface(AccountProxy.abi);
      const PositionManager420Interface = new ethers.utils.Interface(PositionManager420.abi);

      const multicall = [
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
          callData: PositionManager420Interface.encodeFunctionData('increasePosition', [
            ethers.BigNumber.from(params.accountId),
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
        duration: 5000,
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
