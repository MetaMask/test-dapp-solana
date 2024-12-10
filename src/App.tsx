import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { type FC, useMemo } from 'react';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';
import { UnifiedWalletButton, UnifiedWalletProvider } from '@jup-ag/wallet-adapter';
import { SendSOLToRandomAddress } from './components/SendSol';

export const App: FC = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      // new PhantomWalletAdapter(),
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <WalletMultiButton />
            <UnifiedWalletProvider
              wallets={wallets}
              config={{
                autoConnect: false,
                env: 'mainnet-beta',
                metadata: {
                  name: 'UnifiedWallet',
                  description: 'UnifiedWallet',
                  url: 'https://jup.ag',
                  iconUrls: ['https://jup.ag/favicon.ico'],
                },
                walletlistExplanation: {
                  href: 'https://station.jup.ag/docs/additional-topics/wallet-list',
                },
                // walletPrecedence: ['MetaMask'],
                hardcodedWallets: [
                  {
                    id: 'MetaMask',
                    name: 'MetaMask' as any,
                    url: 'https://metamask.io',
                    icon: 'https://cdn.iconscout.com/icon/free/png-512/metamask-2728406-2261817.png',
                  },
                ],
                theme: 'dark',
                lang: 'en',
              }}
            >
              <UnifiedWalletButton />
              <SendSOLToRandomAddress />
            </UnifiedWalletProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </>
  );
};
