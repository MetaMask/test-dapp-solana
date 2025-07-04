import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { type FC, useCallback, useState } from 'react';
import { dataTestIds } from '../test';
import { Button } from './Button';
import { TransactionHash } from './TransactionHash';

export const SendMemo: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [signedTransaction, setSignedTransaction] = useState<VersionedTransaction | undefined>();
  const [transactionHash, settransactionHash] = useState<string | undefined>();
  const [memo, setMemo] = useState<string>('Hello, from the Solana Wallet Adapter example app!');
  const [loading, setLoading] = useState(false);

  /**
   * Handle memo change.
   */
  const handleMemoChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMemo(event.target.value);
  }, []);

  /**
   * Get the transaction to sign.
   */
  const getTransaction = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      throw new WalletNotConnectedError();
    }
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    const memoV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        new TransactionInstruction({
          data: Buffer.from(memo),
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        }),
      ],
    }).compileToV0Message();
    const transaction = new VersionedTransaction(memoV0);
    return transaction;
  }, [publicKey, signTransaction, connection, memo]);

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
      // await connection.confirmTransaction(transactionHash, 'confirmed'); // TODO: Disabled for E2E tests until local RPC is available
      settransactionHash(transactionHash);
    } finally {
      setLoading(false);
    }
  }, [getTransaction, sendTransaction, connection]);

  return (
    <div data-testid={dataTestIds.testPage.sendMemo.id}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="memo">Memo:</label>
        <input
          data-testid={dataTestIds.testPage.sendMemo.memo}
          type="text"
          value={memo}
          onChange={handleMemoChange}
          style={{ width: '90%', padding: '0.5rem', marginTop: '0.5rem' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Button
          data-testid={dataTestIds.testPage.sendMemo.signTransaction}
          onClick={handleSignTransaction}
          disabled={!publicKey}
          loading={loading}
        >
          Sign Transaction
        </Button>

        <Button
          data-testid={dataTestIds.testPage.sendMemo.sendTransaction}
          onClick={handleSignAndSendTransaction}
          disabled={!publicKey}
          loading={loading}
        >
          Sign and Send Transaction
        </Button>
      </div>

      {signedTransaction && (
        <>
          <h3>Signed transaction</h3>
          <pre data-testid={dataTestIds.testPage.sendMemo.signedTransaction} className="signedTransactions">
            {Buffer.from(signedTransaction?.signatures[0]!).toString('base64')}
          </pre>
        </>
      )}

      {transactionHash && (
        <>
          <h3>Transaction</h3>
          <TransactionHash data-testid={dataTestIds.testPage.sendMemo.transactionHash} hash={transactionHash} />
        </>
      )}
    </div>
  );
};
