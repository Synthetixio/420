const abi =[
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
  'function getLiquidityPositions(address walletAddress) returns (tuple(uint128 accountId, int256 debtAmount, uint256 cRatio, uint256 collateralAmount, uint256 collateralPrice, uint256 collateralValue)[] liquidityPositions)',
  'function getPositions(address walletAddress) view returns (tuple(uint128 accountId, uint128 loanAmount, uint64 loanStartTime, uint32 loanDuration, uint32 loanDecayPower, uint256 collateralAmount, uint256 collateralPrice, uint256 collateralValue)[] positions)',
  'function getTotalDeposit(address walletAddress) view returns (uint256 totalDeposit)',
  'function getTotalLoan(address walletAddress) view returns (uint256 totalLoan)',
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
      // https://etherscan.io/address/0x63275D081C4A77AE69f76c4952F9747a5559a519#code
      return { address: '0x63275D081C4A77AE69f76c4952F9747a5559a519', abi };
    }
    case '10-main': {
      // https://optimistic.etherscan.io/address/0x22f86f928a6575397359b3c93c8895d1e6201cdc#code
      return { address: '0x22f86f928a6575397359b3c93c8895d1e6201cdc', abi };
    }
    default: {
      throw new Error(`Unsupported deployment ${deployment} for Pool420`);
    }
  }
}
