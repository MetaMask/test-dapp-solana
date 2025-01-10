import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { type FC, useMemo } from 'react';
// Dirty fix specific to Bun. TODO: Improve it
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import { SendSOLToRandomAddress } from './components/SendSol';

import { MetaMaskWalletAdapter } from './metamask-wallet-adapter/adapter';
import { registerMetaMaskWalletAdapter } from './metamask-wallet-adapter/wallet';
import { LedgerWalletAdapter, PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export const App: FC = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  void registerMetaMaskWalletAdapter();

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new LedgerWalletAdapter(),
      // new TorusWalletAdapter(),
      // new TrustWalletAdapter(),
      // new MathWalletAdapter({ endpoint }),
      // new TokenPocketWalletAdapter(),
      // new CoinbaseWalletAdapter({ endpoint }),
      // new SolflareWalletAdapter(),
      // new SolongWalletAdapter({ endpoint }),
      // new Coin98WalletAdapter({ endpoint }),
      // new SafePalWalletAdapter({ endpoint }),
      // new BitpieWalletAdapter({ endpoint }),
      // new BitgetWalletAdapter({ endpoint }),
      new MetaMaskWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', gap: '10px', width: '100vw' }}>
              <WalletMultiButton />
              <WalletDisconnectButton />
              <SendSOLToRandomAddress />
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};
