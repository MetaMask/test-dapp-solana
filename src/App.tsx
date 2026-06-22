import { createSolanaClient } from '@metamask/connect-solana';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { type FC, useEffect, useMemo, useRef } from 'react';

import '@solana/wallet-adapter-react-ui/styles.css';
import { CoinbaseWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { EndpointProvider, useEndpoint } from './context/EndpointProvider';
import { TestPage } from './pages/TestPage';

const AppContent: FC = () => {
  const { endpoint } = useEndpoint();

  // Adapter-based wallets are still registered alongside MetaMask. MetaMask is
  // discovered via Wallet Standard auto-registration (see createSolanaClient below).
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new CoinbaseWalletAdapter({ endpoint }), new SolflareWalletAdapter()],
    [endpoint],
  );

  const registered = useRef(false);
  useEffect(() => {
    if (registered.current) {
      return;
    }
    registered.current = true;
    // createSolanaClient registers MetaMask with the Wallet Standard registry,
    // so the wallet adapter discovers it without adding it to `wallets`.
    createSolanaClient({
      dapp: {
        name: 'playground',
        url: 'https://playground.metamask.io',
      },
    }).catch((error) => {
      console.error('Failed to initialize MetaMask Solana client', error);
    });
  }, []);

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
