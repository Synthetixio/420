export async function importPythERC7412Wrapper(
  chainId?: number,
  preset?: string
): Promise<{ address: string; abi: string[] }> {
  if (!preset) {
    throw new Error(`Missing preset`);
  }
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    default: {
      throw new Error(`Unsupported deployment ${deployment} for PythERC7412Wrapper`);
    }
  }
}
