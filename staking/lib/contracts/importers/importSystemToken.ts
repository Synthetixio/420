export async function importSystemToken(
  chainId?: number,
  preset?: string
): Promise<{
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}> {
  if (!preset) {
    throw new Error(`Missing preset`);
  }
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      const [{ default: systemToken }] = await Promise.all([
        import('@synthetixio/v3-contracts/1-main/systemToken.json'),
      ]);
      return systemToken;
    }
    case '10-main': {
      const [{ default: systemToken }] = await Promise.all([
        import('@synthetixio/v3-contracts/10-main/systemToken.json'),
      ]);
      return systemToken;
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for SystemToken`);
    }
  }
}
