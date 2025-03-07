import { devtoolsFormatters } from '@synthetixio/devtools-formatters';
import { magicWallet } from '@synthetixio/magic-wallet';
import ReactDOM from 'react-dom/client';
import { App } from './App';

const container = document.querySelector('#app');

declare global {
  var $magicWallet: `0x${string}`; // eslint-disable-line no-var
  var $chainId: number; // eslint-disable-line no-var
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  var ethereum: any;
  // biome-ignore lint/suspicious/noExplicitAny: matomo here
  var _paq: any;
}

export async function bootstrap() {
  if (!container) {
    throw new Error('Container #app does not exist');
  }
  if (window.localStorage.DEBUG === 'true') {
    await devtoolsFormatters();
  }
  if (window.localStorage.MAGIC_WALLET && `${window.localStorage.MAGIC_WALLET}`.length === 42) {
    await magicWallet(window.localStorage.MAGIC_WALLET);
  }
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}
