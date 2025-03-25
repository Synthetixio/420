import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useSigner, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useBalances');

export type Balance = {
  accountId: ethers.BigNumber;
  usdAvailable: ethers.BigNumber;
  usdDeposited: ethers.BigNumber;
  usdAssigned: ethers.BigNumber;
  usdLocked: ethers.BigNumber;
  collateralPrice: ethers.BigNumber;
  collateralAvailable: ethers.BigNumber;
  collateralDeposited: ethers.BigNumber;
  collateralAssigned: ethers.BigNumber;
  collateralLocked: ethers.BigNumber;
};

export function useBalances() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const signer = useSigner();
  const walletAddress = activeWallet?.address;
  const { data: Pool420 } = usePool420();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useBalances',
      { walletAddress },
      { contractsHash: contractsHash([Pool420]) },
    ],
    enabled: Boolean(signer && walletAddress && Pool420),
    queryFn: async (): Promise<Balance[]> => {
      if (!(signer && walletAddress && Pool420)) throw 'OMFG';

      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, signer);
      const balancesRaw = await Pool420Contract.getBalances(walletAddress);
      const balances = balancesRaw.map((balance: Balance) => ({
        accountId: balance.accountId,
        usdAvailable: balance.usdAvailable,
        usdDeposited: balance.usdDeposited,
        usdAssigned: balance.usdAssigned,
        usdLocked: balance.usdLocked,
        collateralPrice: balance.collateralPrice,
        collateralAvailable: balance.collateralAvailable,
        collateralDeposited: balance.collateralDeposited,
        collateralAssigned: balance.collateralAssigned,
        collateralLocked: balance.collateralLocked,
      }));
      log('balances', balances);
      return balances;
    },
  });
}
