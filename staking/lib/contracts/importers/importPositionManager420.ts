const abi = [
  'constructor(address CoreProxy_, address AccountProxy_, address TreasuryMarketProxy_, address LegacyMarketProxy_)',
  'error MinDelegationTimeoutPending(uint128 poolId, uint32 timeRemaining)',
  'error NotEnoughAllowance(address walletAddress, address tokenAddress, uint256 requiredAllowance, uint256 availableAllowance)',
  'error NotEnoughBalance(address walletAddress, address tokenAddress, uint256 requiredAmount, uint256 availableAmount)',
  'function AccountProxy() view returns (address)',
  'function CoreProxy() view returns (address)',
  'function LegacyMarketProxy() view returns (address)',
  'function TreasuryMarketProxy() view returns (address)',
  'function UINT256_MAX() view returns (uint256)',
  'function V2xResolver() view returns (address)',
  'function closePosition(uint128 accountId)',
  'function get$SNX() view returns (address $SNX)',
  'function get$sUSD() view returns (address $sUSD)',
  'function get$snxUSD() view returns (address $snxUSD)',
  'function getAccounts() view returns (uint128[] accountIds)',
  'function getTotalDeposit() view returns (uint256 totalDeposit)',
  'function getTotalLoan() view returns (uint256 totalLoan)',
  'function getV2x() view returns (address v2x)',
  'function getV2xUsd() view returns (address v2xUsd)',
  'function migratePosition(uint128 sourcePoolId, uint128 accountId)',
  'function onERC721Received(address, address, uint256, bytes) pure returns (bytes4)',
];

export async function importPositionManager420(
  chainId?: number,
  preset?: string
): Promise<{ address: string; abi: string[] }> {
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      // https://etherscan.io/address/0x100c6c18381c9a7527762063047236356bbd0b8d#code
      return { address: '0x100c6c18381c9a7527762063047236356bbd0b8d', abi };
    }
    case '10-main': {
      // https://optimistic.etherscan.io/address/0x693cd986b8b840607d3c7952f038bc22da636f48#code
      return { address: '0x693cd986b8b840607d3c7952f038bc22da636f48', abi };
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for PositionManager420`);
    }
  }
}
