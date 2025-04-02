import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { type FC, useMemo } from 'react';

import '@solana/wallet-adapter-react-ui/styles.css';
import { TestPage } from './pages/TestPage';

import { CoinbaseWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { RPC_HTTP_ENDPOINT } from './config';

export const App: FC = () => {
  const endpoint = RPC_HTTP_ENDPOINT;

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new CoinbaseWalletAdapter({ endpoint }), new SolflareWalletAdapter()],
    [endpoint],
  );

  return (
    <>
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
    </>
  );
};
