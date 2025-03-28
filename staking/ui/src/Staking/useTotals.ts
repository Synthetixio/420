import { contractsHash } from '@_/format';
import { useNetwork, useProvider, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useTotals');

export type Totals = {
  deposit: ethers.BigNumber;
  loan: ethers.BigNumber;
  burn: ethers.BigNumber;
  collateralPrice: ethers.BigNumber;
};

export function useTotals() {
  const provider = useProvider();
  const { network } = useNetwork();
  const { activeWallet } = useWallet();
  const walletAddress = activeWallet?.address;

  const { data: Pool420 } = usePool420();

  return useQuery<Totals, Error>({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useTotals',
      { walletAddress },
      { contractsHash: contractsHash([Pool420]) },
    ],
    enabled: Boolean(provider && Pool420 && walletAddress),
    queryFn: async () => {
      if (!(provider && Pool420 && walletAddress)) {
        throw new Error('OMFG');
      }
      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, provider);
      const totalsRaw = await Pool420Contract.getTotals(walletAddress);
      const totals = {
        deposit: totalsRaw.deposit,
        loan: totalsRaw.loan,
        burn: totalsRaw.burn,
        collateralPrice: totalsRaw.collateralPrice,
      };
      log('totals', totals);
      return totals;
    },
  });
}
