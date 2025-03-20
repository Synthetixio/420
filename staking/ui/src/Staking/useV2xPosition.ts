import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider, useWallet } from '@_/useBlockchain';
import { usePool420 } from '@_/usePool420';
import { useV2xSynthetix } from '@_/useV2xSynthetix';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useV2xPosition');

export function useV2xPosition() {
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: Pool420 } = usePool420();
  const { data: V2xSynthetix } = useV2xSynthetix();

  const { activeWallet } = useWallet();
  const walletAddress = activeWallet?.address;

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useV2xPosition',
      { walletAddress },
      { contractsHash: contractsHash([V2xSynthetix, Pool420]) },
    ],
    enabled: Boolean(network && provider && V2xSynthetix && walletAddress),
    queryFn: async () => {
      if (!(network && provider && Pool420 && V2xSynthetix && walletAddress)) {
        throw new Error('OMFG');
      }
      log('walletAddress', walletAddress);
      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, provider);
      const SynthetixProxyAddress = await Pool420Contract.getV2x();
      log('SynthetixProxyAddress', SynthetixProxyAddress);

      const V2xSynthetixContract = new ethers.Contract(
        SynthetixProxyAddress,
        V2xSynthetix.abi,
        provider
      );

      const collateralAmount = await V2xSynthetixContract.collateral(walletAddress);
      log('collateralAmount', collateralAmount);

      let cRatio = ethers.BigNumber.from(0);
      if (collateralAmount.gt(0)) {
        const collateralisationRatio =
          await V2xSynthetixContract.collateralisationRatio(walletAddress);
        if (collateralisationRatio.gt(0)) {
          cRatio = ethers.utils
            .parseEther('1')
            .mul(ethers.utils.parseEther('1'))
            .div(collateralisationRatio);
          log('cRatio', cRatio);
        }
      }

      const debt = await V2xSynthetixContract.debtBalanceOf(
        walletAddress,
        ethers.utils.formatBytes32String('sUSD')
      );
      log('debt', debt);

      return { collateralAmount, cRatio, debt };
    },
  });
}
