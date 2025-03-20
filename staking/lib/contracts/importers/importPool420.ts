const abi = [
  'function AccountProxy() view returns (address)',
  'function CoreProxy() view returns (address)',
  'function LegacyMarketProxy() view returns (address)',
  'function TreasuryMarketProxy() view returns (address)',
  'function V2xResolver() view returns (address)',
  'function get$SNX() view returns (address $SNX)',
  'function get$sUSD() view returns (address $sUSD)',
  'function get$snxUSD() view returns (address $snxUSD)',
  'function getAccounts() view returns (uint128[] accountIds)',
  'function getTotalDeposit() view returns (uint256 totalDeposit)',
  'function getTotalLoan() view returns (uint256 totalLoan)',
  'function getV2x() view returns (address v2x)',
  'function getV2xUsd() view returns (address v2xUsd)'
];

export async function importPool420(
  chainId?: number,
  preset?: string
): Promise<{ address: string; abi: string[] }> {
  const deployment = `${Number(chainId).toFixed(0)}-${preset}`;
  switch (deployment) {
    case '1-main': {
      // https://etherscan.io/address/0x63ad1ce97c34f157f851944593d3dee952824e9c#code
      return { address: '0x63ad1ce97c34f157f851944593d3dee952824e9c', abi };
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
