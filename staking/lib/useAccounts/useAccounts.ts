import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useSigner, useWallet } from '@_/useBlockchain';
import { usePositionManagerNewPool } from '@_/usePositionManagerNewPool';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useAccounts');

export function useAccounts() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const signer = useSigner();
  const walletAddress = activeWallet?.address;
  const { data: PositionManagerNewPool } = usePositionManagerNewPool();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Accounts',
      { walletAddress },
      { contractsHash: contractsHash([PositionManagerNewPool]) },
    ],
    enabled: Boolean(signer && walletAddress && PositionManagerNewPool),
    queryFn: async (): Promise<ethers.BigNumber[]> => {
      if (!(signer && walletAddress && PositionManagerNewPool)) throw 'OMFG';

      const PositionManagerNewPoolContract = new ethers.Contract(
        PositionManagerNewPool.address,
        PositionManagerNewPool.abi,
        signer
      );
      const accountsIds = await PositionManagerNewPoolContract.getAccounts();
      log('accountsIds', accountsIds);
      return accountsIds;
    },
  });
}
