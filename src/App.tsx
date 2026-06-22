import { type Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { type FC, useMemo, useRef } from 'react';

import '@solana/wallet-adapter-react-ui/styles.css';
import { TestPage } from './pages/TestPage';

import { CoinbaseWalletAdapter, PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import type { SolanaChain } from '@solana/wallet-standard-chains';
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter';
import { EndpointProvider, useEndpoint } from './context/EndpointProvider';

export function createWalletAdapters(
  endpoint: string,
  network: SolanaChain,
  origin = window.location.origin,
): Adapter[] {
  const wallets: Adapter[] = [
    new PhantomWalletAdapter(),
    new CoinbaseWalletAdapter({ endpoint }),
    new SolflareWalletAdapter(),
  ];

  if (network === 'solana:mainnet') {
    wallets.push(
      new WalletConnectWalletAdapter({
        network: WalletAdapterNetwork.Mainnet,
        options: {
          projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? '',
          metadata: {
            name: 'MetaMask Solana Test DApp',
            description: 'Test DApp for Solana',
            url: origin,
            icons: [],
          },
        },
      }),
    );
  }

  return wallets;
}

const AppContent: FC = () => {
  const { endpoint, network } = useEndpoint();

  // Capture the network/endpoint at mount time so adapters are only
  // created once. Network/endpoint switches are handled by
  // ConnectionProvider, avoiding a full reconnect.
  const initialEndpoint = useRef(endpoint);
  const initialNetwork = useRef(network);

  const wallets = useMemo(() => createWalletAdapters(initialEndpoint.current, initialNetwork.current), []);

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
