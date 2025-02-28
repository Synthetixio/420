import {
  importPositionManager,
  importPositionManagerAndromedaStataUSDC,
  importPositionManagerAndromedaUSDC,
} from '@_/contracts';
import { type Network, useNetwork } from '@_/useBlockchain';
import { type CollateralType } from '@_/useCollateralTypes';
import { useSynthTokens } from '@_/useSynthTokens';
import { useQuery } from '@tanstack/react-query';

export function usePositionManagerForCollateral({
  collateralType,
  customNetwork,
}: {
  collateralType?: CollateralType;
  customNetwork?: Network;
}) {
  const { network: currentNetwork } = useNetwork();
  const network = customNetwork || currentNetwork;
  const { data: synthTokens } = useSynthTokens(customNetwork);

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'PositionManager',
      { collateralType: collateralType?.address },
      { synthTokens: Boolean(synthTokens) },
    ],
    enabled: Boolean(network && synthTokens && collateralType),
    queryFn: async function () {
      if (!(network && synthTokens && collateralType)) throw 'OMFG';
      const addr = collateralType.address.toLowerCase();
      for (const synthToken of synthTokens) {
        if (addr === synthToken.address.toLowerCase()) {
          if (network.preset === 'andromeda' && synthToken.symbol === 'sUSDC') {
            return importPositionManagerAndromedaUSDC(network.id, network.preset);
          }
          if (network.preset === 'andromeda' && synthToken.symbol === 'sStataUSDC') {
            return importPositionManagerAndromedaStataUSDC(network.id, network.preset);
          }
        }
      }
      return importPositionManager(network.id, network.preset);
    },
    staleTime: Infinity,
    // On some chains this is not available, and that is expected
    throwOnError: false,
  });
}
