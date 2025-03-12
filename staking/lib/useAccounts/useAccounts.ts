import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useSigner, useWallet } from '@_/useBlockchain';
import { usePositionManager420 } from '@_/usePositionManager420';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useAccounts');

export function useAccounts() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const signer = useSigner();
  const walletAddress = activeWallet?.address;
  const { data: PositionManager420 } = usePositionManager420();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Accounts',
      { walletAddress },
      { contractsHash: contractsHash([PositionManager420]) },
    ],
    enabled: Boolean(signer && walletAddress && PositionManager420),
    queryFn: async (): Promise<ethers.BigNumber[]> => {
      if (!(signer && walletAddress && PositionManager420)) throw 'OMFG';

      const PositionManager420Contract = new ethers.Contract(
        PositionManager420.address,
        PositionManager420.abi,
        signer
      );
      const accountsIds = await PositionManager420Contract.getAccounts();
      log('accountsIds', accountsIds);
      return accountsIds;
    },
  });
}
