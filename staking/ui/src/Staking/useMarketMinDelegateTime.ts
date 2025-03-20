import { contractsHash } from '@_/tsHelpers';
import { useNetwork, useProvider } from '@_/useBlockchain';
import { useCoreProxy } from '@_/useCoreProxy';
import { useLegacyMarket } from '@_/useLegacyMarket';
import { useQuery } from '@tanstack/react-query';
import debug from 'debug';
import { ethers } from 'ethers';

const log = debug('snx:useMarketMinDelegateTime');

export function useMarketMinDelegateTime() {
  const { data: CoreProxy } = useCoreProxy();
  const { data: LegacyMarketProxy } = useLegacyMarket();
  const { network } = useNetwork();
  const provider = useProvider();

  return useQuery({
    queryKey: [
      `${network?.id}-${network?.preset}`,
      'MarketMinDelegateTime',
      { contractsHash: contractsHash([CoreProxy, LegacyMarketProxy]) },
    ],
    enabled: Boolean(provider && CoreProxy && LegacyMarketProxy),
    queryFn: async () => {
      if (!(provider && CoreProxy && LegacyMarketProxy)) throw 'OMFG';
      const CoreProxyContract = new ethers.Contract(CoreProxy.address, CoreProxy.abi, provider);
      const LegacyMarketProxyContract = new ethers.Contract(
        LegacyMarketProxy.address,
        LegacyMarketProxy.abi,
        provider
      );

      const marketId = await LegacyMarketProxyContract.marketId();
      log('marketId', marketId);

      const minDelegationTime = await CoreProxyContract.getMarketMinDelegateTime(marketId);
      log('minDelegationTime', minDelegationTime);

      return ethers.BigNumber.from(minDelegationTime);
    },
  });
}
