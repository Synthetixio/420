import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useSigner, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:usePositions');

export type Position = {
  accountId: ethers.BigNumber;
  loanAmount: ethers.BigNumber;
  loanStartTime: number;
  loanDuration: number;
  loanDecayPower: number;
  collateralAmount: ethers.BigNumber;
  collateralPrice: ethers.BigNumber;
};

export function usePositions() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const signer = useSigner();
  const walletAddress = activeWallet?.address;
  const { data: Pool420 } = usePool420();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'usePositions',
      { walletAddress },
      { contractsHash: contractsHash([Pool420]) },
    ],
    enabled: Boolean(signer && walletAddress && Pool420),
    queryFn: async (): Promise<Position[]> => {
      if (!(signer && walletAddress && Pool420)) throw 'OMFG';

      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, signer);
      const positionsRaw = await Pool420Contract.getPositions(walletAddress);
      const positions = positionsRaw.map((position: Position) => ({
        accountId: position.accountId,
        loanAmount: position.loanAmount,
        loanStartTime: position.loanStartTime,
        loanDuration: position.loanDuration,
        loanDecayPower: position.loanDecayPower,
        collateralAmount: position.collateralAmount,
        collateralPrice: position.collateralPrice,
      }));
      log('positions', positions);
      return positions;
    },
  });
}
