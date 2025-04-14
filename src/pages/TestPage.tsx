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
import { dataTestIds } from '../test';
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
        <Header data-testid={dataTestIds.header.id}/>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 2fr))',
          gap: '2rem',
        }}
      >
        {!isMainNet && (
          <Test key="faucet" title="Faucet">
            <FaucetTest data-testid={dataTestIds.testPage.faucet.id} />
          </Test>
        )}
        <Test key="signMessage" title="Sign Message">
          <SignMessage data-testid={dataTestIds.testPage.signMessage.id} />
        </Test>
        <Test key="sendSol" title="Transfert SOL">
          <SendSOL data-testid={dataTestIds.testPage.sendSol.id}/>
        </Test>
        <Test key="sendSolVersioned" title="Transfert SOL (versioned)">
          <SendSOLVersioned data-testid={dataTestIds.testPage.sendSolVersioned.id}/>
        </Test>
        <Test key="sendMemo" title="Send Memo">
          <SendMemo data-testid={dataTestIds.testPage.sendMemo.id}/>
        </Test>
        <Test key="sendWSol" title="Transfert WSOL">
          <SendWSol data-testid={dataTestIds.testPage.sendWSol.id}/>
        </Test>
        <Test key="partialSignTransaction" title="Partial Sign Transaction">
          <PartialSignTransaction data-testid={dataTestIds.testPage.partialSignTransaction.id}/>
        </Test>
      </div>
    </div>
  );
};
