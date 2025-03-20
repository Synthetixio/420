export async function importAllErrors(
  chainId?: number,
  preset?: string
): Promise<{ address: undefined; abi: string[] }> {
  if (!preset) {
    throw new Error(`Missing preset`);
  }
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      const [{ default: abi }] = await Promise.all([
        import('@synthetixio/v3-contracts/1-main/AllErrors.readable.json'),
      ]);
      return { address: undefined, abi };
    }
    case '10-main': {
      const [{ default: abi }] = await Promise.all([
        import('@synthetixio/v3-contracts/10-main/AllErrors.readable.json'),
      ]);
      return { address: undefined, abi };
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for AllErrors`);
    }
  }
}
