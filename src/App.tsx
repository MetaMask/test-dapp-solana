import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { type FC, useEffect, useMemo, useRef } from 'react';

import '@solana/wallet-adapter-react-ui/styles.css';
import { registerSolanaWalletStandard } from '@metamask/solana-wallet-standard';
import { CoinbaseWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useSDK } from './SDKProvider';
import { EndpointProvider, useEndpoint } from './context/EndpointProvider';
import { TestPage } from './pages/TestPage';

const AppContent: FC = () => {
  const { endpoint } = useEndpoint();

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new CoinbaseWalletAdapter({ endpoint }), new SolflareWalletAdapter()],
    [endpoint],
  );

  const { getProvider } = useSDK();
  const registered = useRef(false);
  useEffect(() => {
    if (registered.current) {
      return;
    }
    registered.current = true;
    (async () => {
      // TODO: fix this
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for the SDK to be initialized

      const provider = await getProvider();
      if (provider) {
        registerSolanaWalletStandard({ client: provider });
      }
    })();
  }, [getProvider]);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              height: '100vh',
              width: '100vw',
              padding: '1rem',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '1600px',
                margin: '0 auto',
                textAlign: 'center',
              }}
            >
              <TestPage />
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const App: FC = () => {
  return (
    <EndpointProvider>
      <AppContent />
    </EndpointProvider>
  );
};
