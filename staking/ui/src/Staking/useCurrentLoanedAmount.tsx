import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { useTreasuryMarketProxy } from '@_/useTreasuryMarketProxy';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useCurrentLoanedAmount');

export function useCurrentLoanedAmount() {
  const [params] = useParams<HomePageSchemaType>();

  const provider = useProvider();
  const { network } = useNetwork();

  const { data: TreasuryMarketProxy } = useTreasuryMarketProxy();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useCurrentLoanedAmount',
      { accountId: params.accountId },
      { contractsHash: contractsHash([TreasuryMarketProxy]) },
    ],
    enabled: Boolean(network && provider && TreasuryMarketProxy && params.accountId),
    queryFn: async () => {
      if (!(network && provider && TreasuryMarketProxy && params.accountId)) {
        throw new Error('OMFG');
      }
      log('accountId', params.accountId);
      const TreasuryMarketProxyContract = new ethers.Contract(
        TreasuryMarketProxy.address,
        TreasuryMarketProxy.abi,
        provider
      );
      const loanedAmount = await TreasuryMarketProxyContract.loanedAmount(params.accountId);
      log('loanedAmount', loanedAmount);

      return loanedAmount;
    },
  });
}
