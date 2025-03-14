import { useNetwork, useProvider, useSigner } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useCreateAccount');

export function useCreateAccount() {
  const { data: CoreProxy } = useCoreProxy();
  const signer = useSigner();
  const { network } = useNetwork();
  const provider = useProvider();

  const queryClient = useQueryClient();
  return {
    enabled: Boolean(network && CoreProxy),
    mutation: useMutation({
      mutationFn: async () => {
        if (!(CoreProxy && signer && provider)) throw 'OMFG';

        const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, signer);
        const txn = await CoreProxyContract['createAccount()']();
        log('txn', txn);
        const receipt = await provider.waitForTransaction(txn.hash);
        log('receipt', receipt);

        let newAccountId: string | undefined;

        for (const txLog of receipt.logs) {
          if (txLog.topics[0] === CoreProxyContract.interface.getEventTopic('AccountCreated')) {
            const [accountId] = CoreProxyContract.interface.decodeEventLog(
              'AccountCreated',
              txLog.data,
              txLog.topics
            );
            newAccountId = accountId;
          }
        }
        log('newAccountId', newAccountId);

        if (newAccountId) {
          return newAccountId;
        }
        throw new Error('Could not find new account id');
      },

      onSuccess: async () => {
        const deployment = `${network?.id}-${network?.preset}`;
        await Promise.all(
          [
            //
            'Accounts',
          ].map((key) => queryClient.invalidateQueries({ queryKey: [deployment, key] }))
        );
      },
    }),
  };
}
