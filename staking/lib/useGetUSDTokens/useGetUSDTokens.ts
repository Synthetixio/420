import { USDC_BASE_MARKET } from '@_/isBaseAndromeda';
import { Network, useNetwork, useProviderForChain } from '@_/useBlockchain';
import { useCollateralTypes } from '@_/useCollateralTypes';
import { useSpotMarketProxy } from '@_/useSpotMarketProxy';
import { useSystemToken } from '@_/useSystemToken';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';

export function useGetUSDTokens(customNetwork?: Network) {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork ?? currentNetwork;
  const provider = useProviderForChain(network);

  const { data: collateralTypes } = useCollateralTypes(false, customNetwork);
  const { data: SpotMarketProxy } = useSpotMarketProxy(customNetwork);
  const { data: systemToken } = useSystemToken(customNetwork);

  return useQuery({
    queryKey: [`${network?.id}-${network?.preset}`, 'GetUSDTokens'],
    enabled: Boolean(
      SpotMarketProxy && provider && network && collateralTypes?.length && systemToken
    ),
    queryFn: async () => {
      if (!(SpotMarketProxy && provider && network && collateralTypes?.length && systemToken)) {
        throw 'OMFG';
      }
      const SpotMarketProxyContract = new ethers.Contract(
        SpotMarketProxy.address,
        SpotMarketProxy.abi,
        provider
      );

      const USDC: string =
        network?.preset === 'andromeda'
          ? (await SpotMarketProxyContract.getWrapper(USDC_BASE_MARKET))?.wrapCollateralType
          : undefined;

      return {
        snxUSD: systemToken.address,
        sUSD: collateralTypes?.find((type) =>
          network?.preset === 'andromeda'
            ? type.symbol.toLowerCase() === 'usdc'
            : type.symbol.toLowerCase() === 'susdc'
        )?.tokenAddress,
        USDC,
      };
    },
  });
}
