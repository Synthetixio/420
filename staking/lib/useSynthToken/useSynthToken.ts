import { contractsHash } from '@_/tsHelpers';
import { Network, useNetwork } from '@_/useBlockchain';
import { type CollateralType } from '@_/useCollateralTypes';
import { useSynthTokens } from '@_/useSynthTokens';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';

const log = debug('snx:useSynthToken');

export function useSynthToken(collateralType?: CollateralType, networkOverride?: Network) {
  const { data: synthTokens } = useSynthTokens();
  const { network: currentNetwork } = useNetwork();
  const network = networkOverride || currentNetwork;

  return useQuery({
    enabled: Boolean(network && collateralType && synthTokens),
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'SynthToken',
      { collateralType: collateralType?.address },
      { contractsHash: contractsHash([...(synthTokens ?? [])]) },
    ],
    queryFn: async () => {
      if (!(network && collateralType && synthTokens)) {
        throw new Error('OMG');
      }
      log('collateralType', collateralType);

      const tokenAddress = collateralType.address.toLowerCase();
      const synthToken = synthTokens.find(
        ({ address, token }) =>
          address.toLowerCase() === tokenAddress ||
          (token && token.address.toLowerCase() === tokenAddress)
      );

      log('synthToken', synthToken);

      return synthToken;
    },
  });
}
