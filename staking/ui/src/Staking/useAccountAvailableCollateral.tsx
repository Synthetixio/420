import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { useCollateralType } from '@_/useCollateralTypes';
import { useCoreProxy } from '@_/useCoreProxy';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useAccountAvailableCollateral');

export function useAccountAvailableCollateral() {
  const [params] = useParams<HomePageSchemaType>();

  const provider = useProvider();
  const { network } = useNetwork();

  const { data: collateralType } = useCollateralType('SNX');
  const { data: CoreProxy } = useCoreProxy();

  const accountId = params.accountId;
  const collateralAddress = collateralType?.tokenAddress;

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'accountAvailableCollateral',
      { accountId, collateralAddress },
      { contractsHash: contractsHash([CoreProxy]) },
    ],
    enabled: Boolean(network && provider && CoreProxy && accountId && collateralAddress),
    queryFn: async () => {
      if (!(network && provider && CoreProxy && accountId && collateralAddress)) {
        throw new Error('OMFG');
      }
      log({ accountId, collateralAddress });
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const accountAvailableCollateral = await CoreProxyContract.getAccountAvailableCollateral(
        accountId,
        collateralAddress
      );
      log('accountAvailableCollateral', accountAvailableCollateral);

      return accountAvailableCollateral;
    },
  });
}
