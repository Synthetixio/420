import { ContractError } from '@_/ContractError';
import { useAccountProxy } from '@_/useAccountProxy';
import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import { useContractErrorParser } from '@_/useContractErrorParser';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { usePool420 } from '@_/usePool420';
import { usePool420Withdraw } from '@_/usePool420Withdraw';
import { useTrustedMulticallForwarder } from '@_/useTrustedMulticallForwarder';
import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';
import React from 'react';
import { useCurrentLoanedAmount } from './useCurrentLoanedAmount';
import { usePositionCollateral } from './usePositionCollateral';
import { useRepaymentPenalty } from './useRepaymentPenalty';

const log = debug('snx:useClosePosition420');

export function useClosePositionPool420() {
  const [params] = useParams<HomePageSchemaType>();

  const signer = useSigner();
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: Pool420Withdraw } = usePool420Withdraw();
  const { data: Pool420 } = usePool420();
  const { data: AccountProxy } = useAccountProxy();
  const { data: TrustedMulticallForwarder } = useTrustedMulticallForwarder();
  const { data: positionCollateral } = usePositionCollateral();
  const { data: loanedAmount } = useCurrentLoanedAmount();
  const { data: repaymentPenalty } = useRepaymentPenalty();

  const isReady =
    network &&
    provider &&
    signer &&
    TrustedMulticallForwarder &&
    Pool420Withdraw &&
    Pool420 &&
    AccountProxy &&
    positionCollateral &&
    positionCollateral.gt(0) &&
    loanedAmount &&
    repaymentPenalty &&
    true;

  const toast = useToast({ isClosable: true, duration: 60_000 });
  const errorParser = useContractErrorParser();

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!isReady) {
        throw new Error('Not ready');
      }
      const repaymentAmount = loanedAmount.add(repaymentPenalty);

      if (repaymentAmount.gt(0)) {
        const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, provider);
        const sUSDAddress = await Pool420Contract.get$sUSD();
        const sUSDContract = new ethers.Contract(
          sUSDAddress,
          [
            'function allowance(address owner, address spender) view returns (uint256)',
            'function approve(address spender, uint256 amount) returns (bool)',
          ],
          signer
        );
        const walletAddress = await signer.getAddress();
        const sUSDAllowance = await sUSDContract.allowance(walletAddress, Pool420Withdraw.address);
        log('sUSDAllowance', sUSDAllowance);

        if (sUSDAllowance.lt(repaymentAmount)) {
          toast.closeAll();
          toast({ title: 'Approving sUSD...', variant: 'left-accent' });
          const sUSDAppoveGasLimit = await sUSDContract.estimateGas.approve(
            Pool420Withdraw.address,
            repaymentAmount
          );
          await sUSDContract.approve(Pool420Withdraw.address, repaymentAmount, {
            gasLimit: sUSDAppoveGasLimit.mul(15).div(10),
          });
        }
      }

      toast.closeAll();
      toast({ title: 'Unstaking SNX...', variant: 'left-accent' });

      const AccountProxyInterface = new ethers.utils.Interface(AccountProxy.abi);
      const Pool420WithdrawInterface = new ethers.utils.Interface(Pool420Withdraw.abi);

      const multicall = [
        {
          target: AccountProxy.address,
          callData: AccountProxyInterface.encodeFunctionData('approve', [
            Pool420Withdraw.address,
            ethers.BigNumber.from(params.accountId),
          ]),
          requireSuccess: true,
        },
        {
          target: Pool420Withdraw.address,
          callData: Pool420WithdrawInterface.encodeFunctionData('closePosition', [
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
          'LiquidityPosition',
          'LiquidityPositions',
          'AccountCollateralUnlockDate',
        ].map((key) => queryClient.invalidateQueries({ queryKey: [deployment, key] }))
      );

      toast.closeAll();
      toast({
        title: 'Success',
        description: 'SNX unstaked.',
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
        title: 'Could not unstake SNX',
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
