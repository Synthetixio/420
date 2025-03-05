import { POOL_ID } from '@_/constants';
import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProviderForChain } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { erc7412Call } from '@_/withERC7412';
import { wei } from '@synthetixio/wei';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';

export function usePositionDebt({
  tokenAddress,
  accountId,
}: {
  tokenAddress?: string;
  accountId?: string;
}) {
  const { data: CoreProxy } = useCoreProxy();
  const { network } = useNetwork();
  const provider = useProviderForChain(network);
  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'PositionDebt',
      { accountId },
      { token: tokenAddress },
      { contractsHash: contractsHash([CoreProxy]) },
    ],
    enabled: Boolean(network && provider && CoreProxy && accountId && tokenAddress),
    queryFn: async () => {
      if (!(network && provider && CoreProxy && accountId && tokenAddress)) {
        throw Error('OMFG');
      }
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);

      const calls = await Promise.all([
        CoreProxyContract.populateTransaction.getPositionDebt(accountId, POOL_ID, tokenAddress),
      ]);

      return await erc7412Call(
        network,
        provider,
        calls,
        (decodedMulticall) => {
          const [debt] = CoreProxyContract.interface.decodeFunctionResult(
            'getPositionDebt',
            decodedMulticall[0].returnData
          );
          return wei(debt);
        },
        'usePositionDebt'
      );
    },
  });
}
