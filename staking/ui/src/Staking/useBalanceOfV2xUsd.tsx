import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useV2xUsd } from '@_/useV2xUsd';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useBalanceOfV2xUsd');

export function useBalanceOfV2xUsd() {
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: Pool420 } = usePool420();
  const { data: V2xUsd } = useV2xUsd();

  const { activeWallet } = useWallet();
  const walletAddress = activeWallet?.address;

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useBalanceOfV2xUsd',
      { walletAddress },
      { contractsHash: contractsHash([V2xUsd, Pool420]) },
    ],
    enabled: Boolean(network && provider && V2xUsd && walletAddress),
    queryFn: async () => {
      if (!(network && provider && Pool420 && V2xUsd && walletAddress)) {
        throw new Error('OMFG');
      }
      log('walletAddress', walletAddress);
      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, provider);
      const V2xUsdAddress = await Pool420Contract.getV2xUsd();
      log('V2xUsdAddress', V2xUsdAddress);

      const V2xUsdContract = new ethers.Contract(V2xUsdAddress, V2xUsd.abi, provider);

      const balanceOfV2xUsd = await V2xUsdContract.transferableSynths(walletAddress);
      log('balanceOfV2xUsd', balanceOfV2xUsd);

      return balanceOfV2xUsd;
    },
  });
}
