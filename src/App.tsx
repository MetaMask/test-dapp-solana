import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { type FC, useMemo } from 'react';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import { SendTokenToRandomAddress } from './components/SendTokenToRandomAddress';

import {
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { MetaMaskWalletAdapter } from './metamask-wallet-adapter/adapter';
import { registerMetaMaskWalletAdapter } from './metamask-wallet-adapter/wallet';

export const App: FC = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const endpoint = 'https://solana-mainnet.g.alchemy.com/v2/fwXMYA4V1ZBjqXHftVYQiy1MwBoaiijk';

  void registerMetaMaskWalletAdapter();

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new LedgerWalletAdapter(),
      // new TorusWalletAdapter(),
      // new TrustWalletAdapter(),
      // new MathWalletAdapter({ endpoint }),
      // new TokenPocketWalletAdapter(),
      new CoinbaseWalletAdapter({ endpoint }),
      new SolflareWalletAdapter(),
      // new SolongWalletAdapter({ endpoint }),
      // new Coin98WalletAdapter({ endpoint }),
      // new SafePalWalletAdapter({ endpoint }),
      // new BitpieWalletAdapter({ endpoint }),
      // new BitgetWalletAdapter({ endpoint }),
      new MetaMaskWalletAdapter(),
    ],
    [],
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                width: '100vw',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <WalletMultiButton />
                <WalletDisconnectButton />
                <SendTokenToRandomAddress />
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};
