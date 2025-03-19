export async function importTrustedMulticallForwarder(
  chainId?: number,
  preset?: string
): Promise<{ address: string; abi: string[] }> {
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      const [{ default: meta }, { default: abi }] = await Promise.all([
        import('@synthetixio/v3-contracts/1-main/meta.json'),
        import('@synthetixio/v3-contracts/1-main/TrustedMulticallForwarder.readable.json'),
      ]);
      return { address: meta.contracts.TrustedMulticallForwarder, abi };
    }
    case '10-main': {
      const [{ default: meta }, { default: abi }] = await Promise.all([
        import('@synthetixio/v3-contracts/10-main/meta.json'),
        import('@synthetixio/v3-contracts/10-main/TrustedMulticallForwarder.readable.json'),
      ]);
      return { address: meta.contracts.TrustedMulticallForwarder, abi };
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for Multicall3`);
    }
  }
}
