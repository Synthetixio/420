import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useSigner, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:usePositions');

export type Position = {
  accountId: ethers.BigNumber;
  loan: ethers.BigNumber;
  burn: ethers.BigNumber;
  penalty: ethers.BigNumber;
  collateral: ethers.BigNumber;
  initialLoan: ethers.BigNumber;
  loanStartTime: ethers.BigNumber;
  loanDuration: number;
  loanDecayPower: number;
  collateralPrice: ethers.BigNumber;
};

export function usePositions() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const signer = useSigner();
  const walletAddress = activeWallet?.address;
  const { data: Pool420 } = usePool420();

  return useQuery<Position[], Error>({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'usePositions',
      { walletAddress },
      { contractsHash: contractsHash([Pool420]) },
    ],
    enabled: Boolean(signer && walletAddress && Pool420),
    queryFn: async () => {
      if (!(signer && walletAddress && Pool420)) throw 'OMFG';

      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, signer);
      const positionsRaw = await Pool420Contract.getPositions(walletAddress);
      const positions = positionsRaw.map((position: Position) => ({
        accountId: position.accountId,
        loan: position.loan,
        burn: position.burn,
        penalty: position.penalty,
        collateral: position.collateral,
        initialLoan: position.initialLoan,
        loanStartTime: position.loanStartTime,
        loanDuration: position.loanDuration,
        loanDecayPower: position.loanDecayPower,
        collateralPrice: position.collateralPrice,
      }));
      log('positions', positions);
      return positions;
    },
  });
}
