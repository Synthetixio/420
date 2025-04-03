const abi = [
  'constructor(address CoreProxy_, address AccountProxy_, address TreasuryMarketProxy_, address LegacyMarketProxy_)',
  'error NotEnoughAllowance(address walletAddress, address tokenAddress, uint256 requiredAllowance, uint256 availableAllowance)',
  'error NotEnoughBalance(address walletAddress, address tokenAddress, uint256 requiredAmount, uint256 availableAmount)',
  'function AccountProxy() view returns (address)',
  'function CoreProxy() view returns (address)',
  'function LegacyMarketProxy() view returns (address)',
  'function TreasuryMarketProxy() view returns (address)',
  'function UINT256_MAX() view returns (uint256)',
  'function V2xResolver() view returns (address)',
  'function get$SNX() view returns (address $SNX)',
  'function get$sUSD() view returns (address $sUSD)',
  'function get$snxUSD() view returns (address $snxUSD)',
  'function getV2x() view returns (address v2x)',
  'function getV2xUsd() view returns (address v2xUsd)',
  'function migratePosition(uint128 sourcePoolId, uint128 accountId)'
];

export async function importPool420Migrate(
  chainId?: number,
  preset?: string
): Promise<{ address: string; abi: string[] }> {
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      // https://etherscan.io/address/0x8bfd24F68149E3d4e9635a6E26b0e43EEfd2C692#code
      return { address: '0x8bfd24F68149E3d4e9635a6E26b0e43EEfd2C692', abi };
    }
    case '10-main': {
      // https://optimistic.etherscan.io/address/0x2305f5f9EF3aBF0d6d02411ACa44F85113b247Af#code
      return { address: '0x2305f5f9EF3aBF0d6d02411ACa44F85113b247Af', abi };
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for Pool420Withdraw`);
    }
  }
}
