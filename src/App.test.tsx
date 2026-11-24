import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App, createWalletAdapters } from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('renders learn react link', () => {
    render(<App />);
    const linkElement = screen.getByText(/Select Wallet/iu);
    expect(linkElement).toBeDefined();
  });

  it('includes WalletConnect adapter on mainnet', () => {
    const wallets = createWalletAdapters(
      'https://api.mainnet-beta.solana.com',
      'solana:mainnet',
      'http://localhost',
    );

    expect(wallets.map(({ name }) => name)).toContain('WalletConnect');
  });

  it('does not include WalletConnect adapter on non-mainnet networks', () => {
    const wallets = createWalletAdapters(
      'https://api.devnet.solana.com',
      'solana:devnet',
      'http://localhost',
    );

    expect(wallets.map(({ name }) => name)).not.toContain('WalletConnect');
  });
});
