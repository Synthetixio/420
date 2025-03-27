import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider, useWallet } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { usePool420 } from '@_/usePool420';
import { useSNX } from '@_/useSNX';
import { useV2xSynthetix } from '@_/useV2xSynthetix';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useV2xPosition');

export function useV2xPosition() {
  const provider = useProvider();
  const { network } = useNetwork();

  const { data: CoreProxy } = useCoreProxy();
  const { data: Pool420 } = usePool420();
  const { data: V2xSynthetix } = useV2xSynthetix();
  const { data: SNX } = useSNX();

  const { activeWallet } = useWallet();
  const walletAddress = activeWallet?.address;

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'Pool 420',
      'useV2xPosition',
      { walletAddress },
      { contractsHash: contractsHash([CoreProxy, V2xSynthetix, Pool420, SNX]) },
    ],
    enabled: Boolean(provider && CoreProxy && V2xSynthetix && Pool420 && SNX && walletAddress),
    queryFn: async () => {
      if (!(provider && CoreProxy && V2xSynthetix && Pool420 && SNX && walletAddress)) {
        throw new Error('OMFG');
      }
      log('walletAddress', walletAddress);
      const Pool420Contract = new ethers.Contract(Pool420.address, Pool420.abi, provider);
      const SynthetixProxyAddress = await Pool420Contract.getV2x();
      log('SynthetixProxyAddress', SynthetixProxyAddress);

      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);

      const collateralPrice = await CoreProxyContract.getCollateralPrice(SNX.address);

      const V2xSynthetixContract = new ethers.Contract(
        SynthetixProxyAddress,
        V2xSynthetix.abi,
        provider
      );

      const collateral = await V2xSynthetixContract.collateral(walletAddress);
      log('collateral', collateral);

      let cRatio = ethers.BigNumber.from(0);
      if (collateral.gt(0)) {
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

      return { collateralPrice, collateral, cRatio, debt };
    },
  });
}
