import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { wei } from '@synthetixio/wei';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';

export async function fetchStakedSnx() {
  const response = await fetch('https://api.synthetix.io/staking-ratio');
  const {
    stakedSnx: { ethereum, optimism },
  } = await response.json();
  return ethereum + optimism;
}

const priceService = new EvmPriceServiceConnection(
  process.env.PYTH_MAINNET_ENDPOINT ||
    'https://hermes-mainnet.rpc.extrnode.com/9b85d7db-f562-48e2-ab56-79c01f212582',
  {
    timeout: 60_000,
    httpRetries: 5,
    verbose: true,
  }
);

const priceFeeds: { [key: string]: string } = {
  SNX: '0x39d020f60982ed892abbcd4a06a276a9f9b7bfbce003204c110b6e488f502da3',
};

export async function fetchPythPrice(symbol: string, time?: number) {
  const feedId = priceFeeds[symbol];
  if (time) {
    const priceFeed = await priceService.getPriceFeed(feedId, time);
    const { price, expo } = priceFeed.getPriceUnchecked();
    return ethers.utils.parseUnits(price, 18 + expo);
  }
  const response = await priceService.getLatestPriceFeeds([feedId]);
  if (response) {
    const [priceFeed] = response;
    const { price, expo } = priceFeed.getPriceUnchecked();
    return ethers.utils.parseUnits(price, 18 + expo);
  }
}

export function useTvl() {
  return useQuery({
    queryKey: ['tvl'],
    queryFn: async () => {
      const [snxPrice, stakedSnx] = await Promise.all([fetchPythPrice('SNX'), fetchStakedSnx()]);
      if (!snxPrice) {
        throw new Error('SNX price not found');
      }
      return wei(snxPrice).mul(stakedSnx).toNumber();
    },
    staleTime: 600_000,
  });
}
