import { contractsHash } from '@_/tsHelpers';
import { type Network, useNetwork, useProviderForChain } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { erc7412Call } from '@_/withERC7412';
import type Wei from '@synthetixio/wei';
import { wei } from '@synthetixio/wei';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useAccountAvailableCollateral');

export const useAccountAvailableCollateral = ({
  accountId,
  tokenAddress,
  network: networkOverride,
}: {
  accountId?: string;
  tokenAddress?: string;
  network?: Network;
}) => {
  const { network: currentNetwork } = useNetwork();
  const network = networkOverride || currentNetwork;
  const { data: CoreProxy } = useCoreProxy(network);
  const provider = useProviderForChain(network);

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'AccountAvailableCollateral',
      { accountId },
      { tokenAddress },
      { contractsHash: contractsHash([CoreProxy]) },
    ],
    enabled: Boolean(network && provider && CoreProxy && accountId && tokenAddress),
    queryFn: async (): Promise<Wei> => {
      if (!(network && provider && CoreProxy && accountId && tokenAddress)) {
        throw new Error('OMFG');
      }
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);

      const getAccountAvailableCollateralCallPromised =
        CoreProxyContract.populateTransaction.getAccountAvailableCollateral(
          accountId,
          tokenAddress
        );
      const calls = await Promise.all([getAccountAvailableCollateralCallPromised]);

      return await erc7412Call(
        network,
        provider,
        calls,
        (decodedMulticall) => {
          const [accountAvailableCollateral] = CoreProxyContract.interface.decodeFunctionResult(
            'getAccountAvailableCollateral',
            decodedMulticall[0].returnData
          );
          log({ tokenAddress, accountAvailableCollateral });
          return wei(accountAvailableCollateral);
        },
        'useAccountAvailableCollateral'
      );
    },
  });
};
