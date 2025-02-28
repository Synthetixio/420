import { POOL_ID } from '@_/constants';
import { contractsHash } from '@_/tsHelpers';
import { Network, useNetwork, useProviderForChain } from '@_/useBlockchain';
import { useCollateralTypes } from '@_/useCollateralTypes';
import { useCoreProxy } from '@_/useCoreProxy';
import { erc7412Call } from '@_/withERC7412';
import { ZodBigNumber } from '@_/zod';
import { wei } from '@synthetixio/wei';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { z } from 'zod';

const VaultCollateralSchema = z
  .object({ value: ZodBigNumber, amount: ZodBigNumber })
  .transform(({ value, amount }) => ({ value: wei(value), amount: wei(amount) }));

export const useVaultsData = (customNetwork?: Network) => {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork ?? currentNetwork;

  const { data: collateralTypes } = useCollateralTypes(false, network);
  const { data: CoreProxy } = useCoreProxy(network);

  const provider = useProviderForChain(network);

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'VaultsData',
      { contractsHash: contractsHash([CoreProxy, ...(collateralTypes ?? [])]) },
    ],
    enabled: Boolean(CoreProxy && collateralTypes && network && provider),
    queryFn: async () => {
      if (!(CoreProxy && collateralTypes && network && provider)) {
        throw Error('useVaultsData should not be enabled when missing data');
      }
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const calls = await Promise.all(
        collateralTypes.map((collateralType) =>
          CoreProxyContract.populateTransaction.getVaultCollateral(
            POOL_ID,
            collateralType.tokenAddress
          )
        )
      );

      return await erc7412Call(
        network,
        provider,
        calls,
        (decodedMulticall) => {
          return decodedMulticall.map(({ returnData }, i) => {
            const CoreProxyInterface = new ethers.utils.Interface(CoreProxy.abi);
            const vaultCollateral = CoreProxyInterface.decodeFunctionResult(
              'getVaultCollateral',
              returnData
            );
            const collateral = VaultCollateralSchema.parse({ ...vaultCollateral });
            return {
              collateral,
              collateralType: collateralTypes[i],
            };
          });
        },
        'useVaultsData'
      );
    },
  });
};
