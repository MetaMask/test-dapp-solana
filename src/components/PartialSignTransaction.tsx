import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { type FC, useCallback, useState } from 'react';
import { Button } from './Button';
import { defaultAddresses } from '../config';

export const PartialSignTransaction: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [signedTransaction, setSignedTransaction] = useState<VersionedTransaction | undefined>();
  const [loading, setLoading] = useState(false);

  /**
   * Get the transaction to partially sign.
   */
  const getTransaction = useCallback(async () => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const payer = new PublicKey(defaultAddresses[0]); // Use the first address as the payer
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    const messageV0 = new TransactionMessage({
      payerKey: payer, // Payer is different of the connected wallet
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        new TransactionInstruction({
          data: Buffer.from('Partial signing test with multiple signers'),
          keys: [
            { pubkey: publicKey, isSigner: true, isWritable: false }, // Connected wallet as signer
            { pubkey: payer, isSigner: true, isWritable: true }, // Payer as signer
          ],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
        }),
      ],
    }).compileToV0Message();
    const transaction = new VersionedTransaction(messageV0);
    return transaction;
  }, [publicKey, connection]);

  /**
   * Handle partial signing of the transaction.
   */
  const handlePartialSignTransaction = useCallback(async () => {
    if (!signTransaction) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    try {
      const transaction = await getTransaction();
      const partiallySignedTransaction = await signTransaction(transaction);
      setSignedTransaction(partiallySignedTransaction);
    } finally {
      setLoading(false);
    }
  }, [getTransaction, signTransaction]);

  return (
    <>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Button onClick={handlePartialSignTransaction} disabled={!publicKey} loading={loading}>
          Partial Sign Transaction
        </Button>
      </div>

      {signedTransaction && (
        <>
          <h3>Partially Signed Transaction</h3>
          <textarea
            id="result"
            style={{ width: '100%', height: '200px', resize: 'none' }}
            value={Buffer.from(signedTransaction?.signatures[0]!).toString('base64')}
            readOnly
            onChange={() => {}}
          />
        </>
      )}
    </>
  );
};
