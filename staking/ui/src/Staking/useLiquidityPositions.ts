import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useSigner, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useLiquidityPositions');

export type LiquidityPosition = {
  accountId: ethers.BigNumber;
  debt: ethers.BigNumber;
  cRatio: ethers.BigNumber;
  collateral: ethers.BigNumber;
  collateralPrice: ethers.BigNumber;
};

export function useLiquidityPositions() {
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const signer = useSigner();
  const walletAddress = activeWallet?.address;
  const { data: Pool420 } = usePool420();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useLiquidityPositions',
      { walletAddress },
      { contractsHash: contractsHash([Pool420]) },
    ],
    enabled: Boolean(signer && walletAddress && Pool420),
    queryFn: async (): Promise<LiquidityPosition[]> => {
      if (!(signer && walletAddress && Pool420)) throw 'OMFG';

      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, signer);
      const liquidityPositionsRaw =
        await Pool420Contract.callStatic.getLiquidityPositions(walletAddress);
      const liquidityPositions = liquidityPositionsRaw.map(
        (liquidityPosition: LiquidityPosition) => ({
          accountId: liquidityPosition.accountId,
          debt: liquidityPosition.debt,
          cRatio: liquidityPosition.cRatio,
          collateral: liquidityPosition.collateral,
          collateralPrice: liquidityPosition.collateralPrice,
        })
      );
      log('liquidityPositions', liquidityPositions);
      return liquidityPositions;
    },
  });
}
