import { ContractError } from '@_/ContractError';
import { useAccountProxy } from '@_/useAccountProxy';
import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import { useContractErrorParser } from '@_/useContractErrorParser';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePositionManagerNewPool } from '@_/usePositionManagerNewPool';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';
import React from 'react';
import { useCurrentLoanedAmount } from './useCurrentLoanedAmount';
import { usePositionCollateral } from './usePositionCollateral';

const log = debug('snx:useClosePositionNewPools');

export function useClosePositionNewPool() {
  const [params] = useParams<HomePageSchemaType>();

  const signer = useSigner();
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: PositionManagerNewPool } = usePositionManagerNewPool();
  const { data: AccountProxy } = useAccountProxy();
  const { data: TrustedMulticallForwarder } = useTrustedMulticallForwarder();
  const { data: positionCollateral } = usePositionCollateral();
  const { data: loanedAmount } = useCurrentLoanedAmount();

  const isReady =
    network &&
    provider &&
    signer &&
    TrustedMulticallForwarder &&
    PositionManagerNewPool &&
    AccountProxy &&
    positionCollateral &&
    positionCollateral.gt(0) &&
    loanedAmount &&
    true;

  const toast = useToast({ isClosable: true, duration: 9000 });
  const errorParser = useContractErrorParser();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!isReady) {
        throw new Error('Not ready');
      }

      const PositionManagerNewPoolContract = new ethers.Contract(
        PositionManagerNewPool.address,
        PositionManagerNewPool.abi,
        signer
      );
      if (loanedAmount.gt(0)) {
        toast.closeAll();
        toast({ title: 'Approving sUSD...', variant: 'left-accent' });
        const sUSDAddress = await PositionManagerNewPoolContract.get$sUSD();
        const sUSDContract = new ethers.Contract(
          sUSDAddress,
          ['function approve(address spender, uint256 amount) returns (bool)'],
          signer
        );
        const sUSDAppoveGasLimit = await sUSDContract.estimateGas.approve(
          PositionManagerNewPool.address,
          loanedAmount
        );
        await sUSDContract.approve(PositionManagerNewPool.address, loanedAmount, {
          gasLimit: sUSDAppoveGasLimit.mul(15).div(10),
        });
      }

      toast.closeAll();
      toast({ title: 'Withdrawing SNX...', variant: 'left-accent' });

      const AccountProxyInterface = new ethers.utils.Interface(AccountProxy.abi);
      const PositionManagerNewPoolInterface = new ethers.utils.Interface(
        PositionManagerNewPool.abi
      );

      const multicall = [
        {
          target: AccountProxy.address,
          callData: AccountProxyInterface.encodeFunctionData('approve', [
            PositionManagerNewPool.address,
            ethers.BigNumber.from(params.accountId),
          ]),
          requireSuccess: true,
        },
        {
          target: PositionManagerNewPool.address,
          callData: PositionManagerNewPoolInterface.encodeFunctionData('closePosition', [
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
      queryClient.invalidateQueries({
        queryKey: [`${network?.id}-${network?.preset}`, 'New Pool'],
      });

      toast.closeAll();
      toast({
        title: 'Success',
        description: 'SNX withdrawn.',
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
        title: 'Could not withdraw SNX',
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
