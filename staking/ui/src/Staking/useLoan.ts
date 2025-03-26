import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { useTreasuryMarketProxy } from '@_/useTreasuryMarketProxy';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useLoan');

export function useLoan({ accountId }: { accountId: ethers.BigNumber }) {
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: TreasuryMarketProxy } = useTreasuryMarketProxy();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useLoan',
      { accountId },
      { contractsHash: contractsHash([TreasuryMarketProxy]) },
    ],
    enabled: Boolean(provider && TreasuryMarketProxy && accountId),
    queryFn: async (): Promise<{
      startTime: ethers.BigNumber;
      duration: ethers.BigNumber;
      power: ethers.BigNumber;
      loanAmount: ethers.BigNumber;
    }> => {
      if (!(provider && TreasuryMarketProxy && accountId)) {
        throw new Error('OMFG');
      }
      log('accountId', accountId);
      const TreasuryMarketProxyContract = new ethers.Contract(
        TreasuryMarketProxy.address,
        TreasuryMarketProxy.abi,
        provider
      );
      const loanRaw = await TreasuryMarketProxyContract.loans(accountId);
      const loan = {
        startTime: loanRaw.startTime,
        duration: loanRaw.duration,
        power: loanRaw.power,
        loanAmount: loanRaw.loanAmount,
      };
      log('loan', loan);
      return loan;
    },
  });
}
