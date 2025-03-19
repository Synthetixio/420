import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { type HomePageSchemaType, useParams } from '@_/useParams';
import { useTreasuryMarketProxy } from '@_/useTreasuryMarketProxy';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useCurrentPenaltyAmount');

export function useRepaymentPenalty() {
  const [params] = useParams<HomePageSchemaType>();

  const provider = useProvider();
  const { network } = useNetwork();

  const { data: TreasuryMarketProxy } = useTreasuryMarketProxy();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useRepaymentPenalty',
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
      const repaymentPenalty = await TreasuryMarketProxyContract.repaymentPenalty(
        ethers.BigNumber.from(params.accountId),
        0
      );
      log('repaymentPenalty', repaymentPenalty);

      return repaymentPenalty;
    },
  });
}
