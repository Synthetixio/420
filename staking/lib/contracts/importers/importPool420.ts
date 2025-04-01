const abi = [
  'function AccountProxy() view returns (address)',
  'function CoreProxy() view returns (address)',
  'function LegacyMarketProxy() view returns (address)',
  'function TreasuryMarketProxy() view returns (address)',
  'function V2xResolver() view returns (address)',
  'function get$SNX() view returns (address $SNX)',
  'function get$sUSD() view returns (address $sUSD)',
  'function get$snxUSD() view returns (address $snxUSD)',
  'function getAccounts(address walletAddress) view returns (uint128[] accountIds)',
  'function getBalances(address walletAddress) view returns (tuple(uint128 accountId, uint256 usdAvailable, uint256 usdDeposited, uint256 usdAssigned, uint256 usdLocked, uint256 collateralPrice, uint256 collateralAvailable, uint256 collateralDeposited, uint256 collateralAssigned, uint256 collateralLocked)[] balances)',
  'function getLiquidityPositions(address walletAddress) returns (tuple(uint128 accountId, int256 debt, uint256 cRatio, uint256 collateral, uint256 collateralPrice)[] liquidityPositions)',
  'function getPositions(address walletAddress) view returns (tuple(uint128 accountId, uint256 loan, uint256 burn, uint256 penalty, uint256 collateral, uint256 initialLoan, uint64 loanStartTime, uint32 loanDuration, uint32 loanDecayPower, uint256 collateralPrice)[] positions)',
  'function getTotals(address walletAddress) view returns (tuple(uint256 deposit, uint256 loan, uint256 burn, uint256 collateralPrice) totals)',
  'function getV2x() view returns (address v2x)',
  'function getV2xUsd() view returns (address v2xUsd)'
]

export async function importPool420(
  chainId?: number,
  preset?: string
): Promise<{ address: string; abi: string[] }> {
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      // https://etherscan.io/address/0xA60df3c11b9aed1f6eA1Eb6AC0B188dfd18Be44c#code
      return { address: '0xA60df3c11b9aed1f6eA1Eb6AC0B188dfd18Be44c', abi };
    }
    case '10-main': {
      // https://optimistic.etherscan.io/address/0x5032c196d9cB343f22e09834e9b61Eef355fb675#code
      return { address: '0x5032c196d9cB343f22e09834e9b61Eef355fb675', abi };
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for Pool420`);
    }
  }
}
