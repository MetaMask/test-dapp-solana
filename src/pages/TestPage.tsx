import { getChainForEndpoint } from '@solana/wallet-standard-util';
import type { FC } from 'react';
import { FaucetTest } from '../components/FaucetTest';
import { Header } from '../components/Header';
import { SendMemo } from '../components/SendMemo';
import { SendSOL } from '../components/SendSol';
import { SendSOLVersioned } from '../components/SendSolVersioned';
import { SendWSolToAddress } from '../components/SendWSolToAddress';
import { SignMessage } from '../components/SignMessage';
import { Test } from '../components/Test';
import { RPC_HTTP_ENDPOINT } from '../config';

export const TestPage: FC = () => {
  const isDevNet = getChainForEndpoint(RPC_HTTP_ENDPOINT) === 'solana:devnet';

  return (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <Header />
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 2fr))',
          gap: '2rem',
        }}
      >
        {isDevNet && (
          <Test key="faucet" title="Devnet Faucet">
            <FaucetTest />
          </Test>
        )}
        <Test key="signMessage" title="Sign Message">
          <SignMessage />
        </Test>
        <Test key="transfertSol" title="Transfert SOL">
          <SendSOL />
        </Test>
        <Test key="transfertSolVersioned" title="Transfert SOL (versioned)">
          <SendSOLVersioned />
        </Test>
        <Test key="sendMemo" title="Send Memo">
          <SendMemo />
        </Test>
        <Test key="transferWSOL" title="Transfert WSOL">
          <SendWSolToAddress />
        </Test>
      </div>
    </div>
  );
};
