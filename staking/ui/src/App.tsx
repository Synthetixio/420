import { TermsModal } from '@_/TermsModal';
import { Fonts, theme } from '@_/theme';
import { ChakraProvider, extendTheme, useColorMode } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Web3OnboardProvider } from '@web3-onboard/react';
import { useEffect } from 'react';
import Head from 'react-helmet';
import { BrowserRouter } from 'react-router-dom';
import { Router } from './Router';
import { onboard } from './onboard';
import { Progress } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchInterval: false, //  if queries needs refetching we should be explicit about it, given erc7412
      staleTime: 300_000, // 5min
      refetchOnWindowFocus: false,
      throwOnError: (e) => {
        console.error(e);
        return false;
      },
    },
    mutations: {
      retry: false,
      throwOnError: (e) => {
        console.error(e);
        return false;
      },
    },
  },
});

const extendedTheme = extendTheme({
  ...theme,
  components: {
    ...theme.components,
    Progress,
  },
});

function ColorMode() {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    if (colorMode === 'light') {
      toggleColorMode();
    }
  }, [colorMode, toggleColorMode]);
  return null;
}

export const App = () => {
  const TERMS_CONDITIONS_ACCEPTED = localStorage.getItem('TERMS_CONDITIONS_ACCEPTED') === 'true';

  return (
    <>
      <Head>
        {/* open graph */}
        <meta property="og:url" content="https://staking.synthetix.io/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Synthetix | 420 Pool" />
        <meta
          property="og:description"
          content="The Liquidity Layer of DeFi. Provide liquidity for the next generation of permissionless protocols"
        />
        <meta property="og:image" content="https://staking.synthetix.io/staking.jpg" />
        <meta property="og:image:alt" content="Synthetix | 420 Pool" />
        <meta property="og:site_name" content="" />
        {/* twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@synthetix_io" />
        <meta name="twitter:creator" content="@synthetix_io" />
        <meta name="twitter:image" content="https://staking.synthetix.io/staking.jpg" />
        <meta name="twitter:url" content="https://staking.synthetix.io/" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <Web3OnboardProvider web3Onboard={onboard}>
          <ChakraProvider theme={extendedTheme}>
            <ColorMode />
            <Fonts />
            <BrowserRouter>
              <TermsModal
                defaultOpen={process.env.NODE_ENV !== 'development' && !TERMS_CONDITIONS_ACCEPTED}
              />
              <Router />
            </BrowserRouter>
            <ReactQueryDevtools />
          </ChakraProvider>
        </Web3OnboardProvider>
      </QueryClientProvider>
    </>
  );
};
