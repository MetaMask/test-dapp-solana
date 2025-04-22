import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, SystemProgram, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { type ChangeEvent, type FC, useCallback, useState } from 'react';
import { dataTestIds, defaultAddresses } from '../test';
import { Button } from './Button';
import { TransactionHash } from './TransactionHash';

export const SendSOLVersioned: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [signedTransaction, setSignedTransaction] = useState<VersionedTransaction | undefined>();
  const [transactionHash, settransactionHash] = useState<string | undefined>();
  const [toAddress, setToAddress] = useState<string>(defaultAddresses[0]);
  const [loading, setLoading] = useState(false);

  /**
   * Handle address change.
   */
  const handleAddressChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setToAddress(event.target.value);
  }, []);

  /**
   * Get the transaction to sign.
   */
  const getTransaction = useCallback(async () => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const lamports = await connection.getMinimumBalanceForRentExemption(0);
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');

    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: Keypair.generate().publicKey,
          lamports,
        }),
      ],
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
  }, [publicKey, connection]);

  /**
   * Sign the transaction.
   */
  const signOnly = useCallback(async () => {
    if (!signTransaction) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    try {
      const transaction = await getTransaction();
      const signature = await signTransaction(transaction);
      setSignedTransaction(signature);
    } finally {
      setLoading(false);
    }
  }, [getTransaction, signTransaction]);

  /**
   * Sign and send the transaction.
   */
  const signAndSend = useCallback(async () => {
    if (!sendTransaction) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    try {
      const transaction = await getTransaction();

      const transactionHash = await sendTransaction(transaction, connection);
      // await connection.confirmTransaction(transactionHash, 'confirmed'); // TODO: Disabled for E2E tests until local RPC is available

      settransactionHash(transactionHash);
    } finally {
      setLoading(false);
    }
  }, [getTransaction, sendTransaction, connection]);

  return (
    <div data-testid={dataTestIds.testPage.sendSolVersioned.id}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="address">Destination Address:</label>
        <input
          data-testid={dataTestIds.testPage.sendSolVersioned.address}
          type="text"
          value={toAddress}
          onChange={handleAddressChange}
          style={{ width: '90%', padding: '0.5rem', marginTop: '0.5rem' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button
          data-testid={dataTestIds.testPage.sendSolVersioned.signTransaction}
          onClick={signOnly}
          disabled={!publicKey}
          loading={loading}
        >
          Sign Transaction
        </Button>
        <Button
          data-testid={dataTestIds.testPage.sendSolVersioned.sendTransaction}
          onClick={signAndSend}
          disabled={!publicKey}
          loading={loading}
        >
          Sign and Send Transaction
        </Button>
      </div>

      {signedTransaction && (
        <>
          <h3>Signed transaction</h3>
          <textarea
            data-testid={dataTestIds.testPage.sendSolVersioned.signedTransaction}
            style={{ width: '100%', height: '200px', resize: 'none' }}
            value={Buffer.from(signedTransaction?.signatures[0]).toString('base64')}
            readOnly
            onChange={() => {}}
          />
        </>
      )}

      {transactionHash && (
        <>
          <h3>Transaction</h3>
          <TransactionHash data-testid={dataTestIds.testPage.sendSolVersioned.transactionHash} hash={transactionHash} />
        </>
      )}
    </div>
  );
};
