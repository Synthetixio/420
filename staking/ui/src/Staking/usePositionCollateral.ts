import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { useCollateralType } from '@_/useCollateralTypes';
import { useCoreProxy } from '@_/useCoreProxy';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:usePositionCollateral');

export function usePositionCollateral() {
  const [params] = useParams<HomePageSchemaType>();

  const provider = useProvider();
  const { network } = useNetwork();

  const { data: collateralType } = useCollateralType('SNX');
  const { data: CoreProxy } = useCoreProxy();

  const accountId = params.accountId;
  const poolId = 8;
  const collateralAddress = collateralType?.tokenAddress;

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'positionCollateral',
      { accountId, poolId, collateralAddress },
      { contractsHash: contractsHash([CoreProxy]) },
    ],
    enabled: Boolean(network && provider && CoreProxy && accountId && poolId && collateralAddress),
    queryFn: async () => {
      if (!(network && provider && CoreProxy && accountId && poolId && collateralAddress)) {
        throw new Error('OMFG');
      }
      log({ accountId, poolId, collateralAddress });
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const positionCollateral = await CoreProxyContract.getPositionCollateral(
        accountId,
        poolId,
        collateralAddress
      );
      log('positionCollateral', positionCollateral);

      return positionCollateral;
    },
  });
}
