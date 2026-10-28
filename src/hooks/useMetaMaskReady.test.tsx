import { WalletReadyState } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMetaMaskReady } from './useMetaMaskReady';

vi.mock('@solana/wallet-adapter-react');

const useWalletMock = vi.mocked(useWallet);

type Wallets = readonly { adapter: { name: string }; readyState: WalletReadyState }[];

function mockWallets(wallets: Wallets): void {
  useWalletMock.mockReturnValue({ wallets } as unknown as ReturnType<typeof useWallet>);
}

describe('useMetaMaskReady', () => {
  beforeEach(() => {
    mockWallets([]);
  });

  it('tracks MetaMask registration and unregistration', () => {
    const { result, rerender } = renderHook(() => useMetaMaskReady());
    expect(result.current).toBe(false);

    mockWallets([{ adapter: { name: 'MetaMask Solana' }, readyState: WalletReadyState.Installed }]);
    rerender();
    expect(result.current).toBe(true);

    mockWallets([]);
    rerender();
    expect(result.current).toBe(false);
  });

  it('ignores MetaMask when it is not ready', () => {
    mockWallets([
      { adapter: { name: 'MetaMask' }, readyState: WalletReadyState.NotDetected },
      { adapter: { name: 'Phantom' }, readyState: WalletReadyState.Installed },
    ]);

    const { result } = renderHook(() => useMetaMaskReady());

    expect(result.current).toBe(false);
  });
});
