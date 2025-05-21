import type { FC } from 'react';
import { FaucetTest } from '../components/FaucetTest';
import { Header } from '../components/Header';
import { PartialSignTransaction } from '../components/PartialSignTransaction';
import { SendMemo } from '../components/SendMemo';
import { SendSOL } from '../components/SendSol';
import { SendSOLVersioned } from '../components/SendSolVersioned';
import { SendWSol } from '../components/SendWSol';
import { SignMessage } from '../components/SignMessage';
import { Test } from '../components/Test';
import { useEndpoint } from '../context/EndpointProvider';

export const TestPage: FC = () => {
  const { network } = useEndpoint();
  const isMainNet = network === 'solana:mainnet';

  return (
    <div style={{ padding: '1rem' }}>
      <div
        style={{
          marginBottom: '2rem',
        }}
      >
        <Header />
      </div>
      <div className="grid">
        {!isMainNet && (
          <Test key="faucet" title="Faucet">
            <FaucetTest />
          </Test>
        )}
        <Test key="signMessage" title="Sign Message">
          <SignMessage />
        </Test>
        <Test key="sendSol" title="Transfert SOL">
          <SendSOL />
        </Test>
        <Test key="sendSolVersioned" title="Transfert SOL (versioned)">
          <SendSOLVersioned />
        </Test>
        <Test key="sendMemo" title="Send Memo">
          <SendMemo />
        </Test>
        <Test key="sendWSol" title="Transfert WSOL">
          <SendWSol />
        </Test>
        <Test key="partialSignTransaction" title="Partial Sign Transaction">
          <PartialSignTransaction />
        </Test>
      </div>
    </div>
  );
};
