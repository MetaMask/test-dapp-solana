import { createSolanaClient } from '@metamask/connect-solana';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';

// Register MetaMask with the Solana Wallet Standard registry once at startup.
// The wallet adapter discovers it via wallet-standard's late-registration event,
// so rendering doesn't need to wait on this.
createSolanaClient({
  dapp: {
    name: 'playground',
    url: 'https://playground.metamask.io',
  },
}).catch((error) => {
  console.error('Failed to initialize MetaMask Solana client', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
