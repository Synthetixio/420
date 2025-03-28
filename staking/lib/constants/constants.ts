import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';

export const ZEROWEI = new Wei(0);

export const D6 = ethers.utils.parseUnits('1', 6);
export const D18 = ethers.utils.parseUnits('1', 18);

export const DEFAULT_QUERY_STALE_TIME = 300_000; // 5min

export const INFURA_KEY = process.env.INFURA_KEY || '8678fe160b1f4d45ad3f3f71502fc57b';

export const SESSION_STORAGE_KEYS = {
  TERMS_CONDITIONS_ACCEPTED: 'TERMS_CONDITIONS_ACCEPTED',
};

export const offchainMainnetEndpoint =
  process.env.PYTH_MAINNET_ENDPOINT ||
  'https://hermes-mainnet.rpc.extrnode.com/9b85d7db-f562-48e2-ab56-79c01f212582';

export const offchainTestnetEndpoint =
  process.env.PYTH_TESTNET_ENDPOINT ||
  'https://hermes-mainnet.rpc.extrnode.com/9b85d7db-f562-48e2-ab56-79c01f212582';

export const tokenOverrides: {
  [key: `${number}-${string}`]: {
    [key: string]:
      | {
          symbol: string;
          displaySymbol: string;
          name: string;
        }
      | undefined;
  };
} = {
  '1-main': {
    '0x10A5F7D9D65bCc2734763444D4940a31b109275f': {
      symbol: 'sUSD',
      displaySymbol: 'sUSD',
      name: 'sUSD',
    },
    '0xb2F30A7C980f052f02563fb518dcc39e6bf38175': {
      symbol: 'sUSD',
      displaySymbol: 'snxUSD',
      name: 'snxUSD',
    },
  },
};

// We only have 1 pool and UI does not support more than one pool
// Will need to refactor when we add new pools
export const POOL_ID = '1';
