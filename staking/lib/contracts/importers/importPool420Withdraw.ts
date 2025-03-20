const abi = [
  'error NotEnoughAllowance(address walletAddress, address tokenAddress, uint256 requiredAllowance, uint256 availableAllowance)',
  'error NotEnoughBalance(address walletAddress, address tokenAddress, uint256 requiredAmount, uint256 availableAmount)',
  'function AccountProxy() view returns (address)',
  'function CoreProxy() view returns (address)',
  'function LegacyMarketProxy() view returns (address)',
  'function TreasuryMarketProxy() view returns (address)',
  'function UINT256_MAX() view returns (uint256)',
  'function V2xResolver() view returns (address)',
  'function closePosition(uint128 accountId)',
  'function withdrawCollateral(uint128 accountId, address collateralType)'
];

export async function importPool420Withdraw(
  chainId?: number,
  preset?: string
): Promise<{ address: string; abi: string[] }> {
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      // https://etherscan.io/address/0xa7163fE9788BF14CcDac854131CAc2C17d1a1676#code
      return { address: '0xa7163fE9788BF14CcDac854131CAc2C17d1a1676', abi };
    }
    case '10-main': {
      // https://optimistic.etherscan.io/address/0x67108f978CDB95e3a316c4366eE1A61FA9071CCE#code
      return { address: '0x67108f978CDB95e3a316c4366eE1A61FA9071CCE', abi };
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for Pool420Withdraw`);
    }
  }
}
