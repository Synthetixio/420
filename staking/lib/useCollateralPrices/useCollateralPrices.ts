import { contractsHash } from '@_/tsHelpers';
import { type Network, useNetwork, useProviderForChain } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { erc7412Call } from '@_/withERC7412';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useCollateralPrices');

export function useCollateralPrices(collateralAddresses: Set<string>, customNetwork?: Network) {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork ?? currentNetwork;
  const provider = useProviderForChain(network);

  const { data: CoreProxy } = useCoreProxy(customNetwork);

  return useQuery({
    enabled: Boolean(network && provider && CoreProxy && collateralAddresses),
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'CollateralPrices',
      {
        contractsHash: contractsHash([
          CoreProxy,
          ...Array.from(collateralAddresses).map((address) => ({ address })),
        ]),
      },
    ],
    queryFn: async () => {
      if (!(network && provider && CoreProxy && collateralAddresses)) {
        throw new Error('OMFG');
      }
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);

      const multicall = Array.from(collateralAddresses).map((address) => ({
        method: 'getCollateralPrice',
        args: [address],
        address,
      }));
      log('multicall', multicall);

      const calls = await Promise.all(
        multicall.map(({ method, args }) => CoreProxyContract.populateTransaction[method](...args))
      );
      log('calls', calls);

      const prices = await erc7412Call(
        network,
        provider,
        calls.map((txn: ethers.PopulatedTransaction & { requireSuccess?: boolean }) => {
          txn.requireSuccess = false;
          return txn;
        }),
        (decodedMulticall) => {
          return multicall.reduce((result, call, i) => {
            if (decodedMulticall[i].success) {
              const [price] = CoreProxyContract.interface.decodeFunctionResult(
                'getCollateralPrice',
                decodedMulticall[i].returnData
              );
              result.set(call.address, price);
            }
            return result;
          }, new Map());
        },
        'useCollateralPrices'
      );
      log('prices', prices);
      return prices;
    },
  });
}
