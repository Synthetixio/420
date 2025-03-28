import { useAccountProxy } from '@_/useAccountProxy';
import { useProvider, useSigner, useWallet } from '@_/useBlockchain';
import { useMutation } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useTransferAccountId');

export function useTransferAccountId(to: string, accountId: ethers.BigNumber) {
  const { data: AccountProxy } = useAccountProxy();
  const { activeWallet } = useWallet();
  const signer = useSigner();
  const provider = useProvider();
  const walletAddress = activeWallet?.address;

  return useMutation({
    mutationFn: async () => {
      if (!AccountProxy) throw new Error('AccountProxy not defined');
      if (!(walletAddress && signer && provider)) throw new Error('Wallet is not connected');
      const AccountProxyContract = new ethers.Contract(
        AccountProxy.address,
        AccountProxy.abi,
        signer
      );
      const txn = await AccountProxyContract.transferFrom(walletAddress, to, accountId);
      log('txn', txn);
      const receipt = await provider.waitForTransaction(txn.hash);
      log('receipt', receipt);
      return receipt;
    },
  });
}
