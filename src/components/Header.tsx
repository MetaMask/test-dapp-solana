import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getChainForEndpoint } from '@solana/wallet-standard-util';
import type { FC } from 'react';
import { RPC_HTTP_ENDPOINT } from '../config';
import { Account } from './Account';

type HeaderProps = {};

/**
 * Header component
 */
export const Header: FC<HeaderProps> = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div
      id="header"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'start',
      }}
    >
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Endpoint:</strong>
        <div>{new URL(RPC_HTTP_ENDPOINT).host}</div>
      </div>
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Chain:</strong>
        <div>{getChainForEndpoint(RPC_HTTP_ENDPOINT)}</div>
      </div>
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Status:</strong>
        <div>{connected ? 'Connected' : 'Not connected'}</div>
      </div>
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Wallet:</strong>
        <div>{publicKey ? <Account account={publicKey.toBase58()} /> : 'N/A'}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {connected ? <WalletDisconnectButton /> : <WalletMultiButton />}
      </div>
    </div>
  );
};
