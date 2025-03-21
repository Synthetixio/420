export async function importCollateralTokens(
  chainId?: number,
  preset?: string
): Promise<
  {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    depositingEnabled: boolean;
    issuanceRatioD18: string;
    liquidationRatioD18: string;
    liquidationRewardD18: string;
    oracleNodeId: string;
    tokenAddress: string;
    minDelegationD18: string;
    oracle: {
      constPrice?: string;
      externalContract?: string;
      stalenessTolerance?: string;
      pythFeedId?: string;
    };
  }[]
> {
  if (!preset) {
    throw new Error(`Missing preset`);
  }
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      const [{ default: collateralTokens }] = await Promise.all([
        import('@synthetixio/v3-contracts/1-main/collateralTokens.json'),
      ]);
      return collateralTokens;
    }
    case '10-main': {
      const [{ default: collateralTokens }] = await Promise.all([
        import('@synthetixio/v3-contracts/10-main/collateralTokens.json'),
      ]);
      return collateralTokens;
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for CollateralTokens`);
    }
  }
}
