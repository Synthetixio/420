import { ContractError } from '@_/ContractError';
import { useAccountProxy } from '@_/useAccountProxy';
import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import type { CollateralType } from '@_/useCollateralTypes';
import { useContractErrorParser } from '@_/useContractErrorParser';
import { useLiquidityPosition } from '@_/useLiquidityPosition';
import { usePool420 } from '@_/usePool420';
import { usePool420Withdraw } from '@_/usePool420Withdraw';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';
import React from 'react';
import { useAccountCollateralUnlockDate } from './useAccountCollateralUnlockDate';
import { useCountdown } from './useCountdown';

const log = debug('snx:useClosePosition420');

export function useWithdrawCollateral({
  accountId,
  collateralType,
}: {
  accountId?: ethers.BigNumber;
  collateralType?: CollateralType;
}) {
  const signer = useSigner();
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: Pool420 } = usePool420();
  const { data: Pool420Withdraw } = usePool420Withdraw();
  const { data: AccountProxy } = useAccountProxy();
  const { data: TrustedMulticallForwarder } = useTrustedMulticallForwarder();
  const { data: liquidityPosition } = useLiquidityPosition({ accountId, collateralType });

  const { data: accountCollateralUnlockDate, isLoading: isLoadingAccountCollateralUnlockDate } =
    useAccountCollateralUnlockDate({ accountId });
  const timeToWithdraw = useCountdown({
    date: accountCollateralUnlockDate,
    isLoading: isLoadingAccountCollateralUnlockDate,
  });

  const isReady =
    accountId &&
    collateralType &&
    network &&
    provider &&
    signer &&
    TrustedMulticallForwarder &&
    Pool420Withdraw &&
    Pool420 &&
    AccountProxy &&
    liquidityPosition &&
    liquidityPosition?.availableCollateral.gt(0) &&
    !timeToWithdraw &&
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
      toast({ title: 'Withdrawing SNX...', variant: 'left-accent' });

      const AccountProxyInterface = new ethers.utils.Interface(AccountProxy.abi);
      const Pool420WithdrawInterface = new ethers.utils.Interface(Pool420Withdraw.abi);

      const multicall = [
        {
          target: AccountProxy.address,
          callData: AccountProxyInterface.encodeFunctionData('approve', [
            Pool420Withdraw.address,
            accountId,
          ]),
          requireSuccess: true,
        },
        {
          target: Pool420Withdraw.address,
          callData: Pool420WithdrawInterface.encodeFunctionData('withdrawCollateral', [
            accountId,
            collateralType.tokenAddress,
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
        description: 'SNX withdrawn.',
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
