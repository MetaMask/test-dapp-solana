import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { type FC, useCallback, useState } from 'react';
import { Button } from './Button';
import { TransactionHash } from './TransactionHash';

export const SendMemo: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [signedTransaction, setSignedTransaction] = useState<VersionedTransaction | undefined>();
  const [transactionHash, settransactionHash] = useState<string | undefined>();
  const [message, setMessage] = useState<string>('Hello, from the Solana Wallet Adapter example app!');
  const [loading, setLoading] = useState(false);

  /**
   * Handle message change.
   */
  const handleMessageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  /**
   * Get the transaction to sign.
   */
  const getTransaction = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      throw new WalletNotConnectedError();
    }
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        new TransactionInstruction({
          data: Buffer.from(message),
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        }),
      ],
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);
    return transaction;
  }, [publicKey, signTransaction, connection, message]);

  /**
   * Sign the transaction.
   */
  const handleSignTransaction = useCallback(async () => {
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
  const handleSignAndSendTransaction = useCallback(async () => {
    if (!sendTransaction) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    try {
      const transaction = await getTransaction();
      const transactionHash = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(transactionHash, 'confirmed');
      settransactionHash(transactionHash);
    } finally {
      setLoading(false);
    }
  }, [getTransaction, sendTransaction, connection]);

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="message">Message:</label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={handleMessageChange}
          style={{ width: '90%', padding: '0.5rem', marginTop: '0.5rem' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Button onClick={handleSignTransaction} disabled={!publicKey} loading={loading}>
          Sign Transaction
        </Button>

        <Button onClick={handleSignAndSendTransaction} disabled={!publicKey} loading={loading}>
          Sign and Send Transaction
        </Button>
      </div>

      {signedTransaction && (
        <>
          <h3>Signed transaction</h3>
          <textarea
            id="result"
            style={{ width: '100%', height: '200px', resize: 'none' }}
            value={Buffer.from(signedTransaction?.signatures[0]!).toString('base64')}
            readOnly
            onChange={() => {}}
          />
        </>
      )}

      {transactionHash && (
        <>
          <h3>Transaction</h3>
          <TransactionHash hash={transactionHash} />
        </>
      )}
    </>
  );
};
