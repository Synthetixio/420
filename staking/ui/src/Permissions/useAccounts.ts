import { useNetwork, useSigner, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useAccounts');

export function useAccounts() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const signer = useSigner();
  const walletAddress = activeWallet?.address;
  const { data: Pool420, dataUpdatedAt: dataUpdatedAtPool420 } = usePool420();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useAccounts',
      { walletAddress },
      { contracts: [dataUpdatedAtPool420] },
    ],
    enabled: Boolean(signer && walletAddress && Pool420),
    queryFn: async (): Promise<ethers.BigNumber[]> => {
      if (!(signer && walletAddress && Pool420)) {
        throw new Error('OMFG');
      }
      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, signer);
      const accountsIds = await Pool420Contract.getAccounts(walletAddress);
      log('accountsIds', accountsIds);
      return accountsIds;
    },
  });
}
