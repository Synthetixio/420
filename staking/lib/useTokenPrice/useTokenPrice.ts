import { ZEROWEI } from '@_/constants';
import { useOfflinePrices } from '@_/useCollateralPriceUpdates';
import { useCollateralTypes } from '@_/useCollateralTypes';
import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';

export const useTokenPrice = (symbol?: string) => {
  const { data: collateralTypes } = useCollateralTypes(true);

  const pythCollateralPrices = collateralTypes?.filter((item) => item.symbol !== 'stataUSDC');

  const { data: collateralPrices } = useOfflinePrices(
    (pythCollateralPrices || []).map((item) => ({
      id: item.tokenAddress,
      oracleId: item.oracleNodeId,
      symbol: item.symbol,
    }))
  );

  return useMemo(() => {
    if (!collateralTypes || !collateralPrices) {
      return ZEROWEI;
    }
    const collateralPrice =
      symbol === 'stataUSDC'
        ? collateralPrices.find((price) => `${price.symbol}`.toUpperCase() === 'USDC')
        : collateralPrices.find(
            (price) => `${price.symbol}`.toUpperCase() === `${symbol}`.toUpperCase()
          );
    return collateralPrice && collateralPrice.price ? wei(collateralPrice.price) : ZEROWEI;
  }, [collateralPrices, collateralTypes, symbol]);
};
