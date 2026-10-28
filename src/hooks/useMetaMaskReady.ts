import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';

function isMetaMaskName(name: string): boolean {
  return name.includes('MetaMask');
}

export function isMetaMaskWalletReady(
  wallets: readonly { adapter: { name: string }; readyState: WalletReadyState }[],
): boolean {
  return wallets.some(
    ({ adapter, readyState }) =>
      isMetaMaskName(adapter.name) &&
      (readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable),
  );
}

export function useMetaMaskReady(): boolean {
  const { wallets } = useWallet();
  return isMetaMaskWalletReady(wallets);
}
