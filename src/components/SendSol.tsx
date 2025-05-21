import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { type ChangeEvent, type FC, useCallback, useState } from 'react';
import { dataTestIds, defaultAddresses } from '../test';
import { Button } from './Button';
import { TransactionHash } from './TransactionHash';

export const SendSOL: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, sendTransaction } = useWallet();
  const [signedTransaction, setSignedTransaction] = useState<Transaction | undefined>();
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
  const getTransaction = useCallback(async (): Promise<Transaction> => {
    if (!publicKey) {
      throw new WalletNotConnectedError();
    }

    const lamports = await connection.getMinimumBalanceForRentExemption(0);
    const { blockhash } = await connection.getLatestBlockhash();

    return new Transaction({
      feePayer: publicKey,
      recentBlockhash: blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(toAddress),
        lamports,
      }),
    );
  }, [publicKey, connection, toAddress]);

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
  }, [signTransaction, getTransaction]);

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
  }, [sendTransaction, getTransaction, connection]);

  return (
    <div data-testid={dataTestIds.testPage.sendSol.id}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="address">Destination Address:</label>
        <input
          data-testid={dataTestIds.testPage.sendSol.address}
          type="text"
          value={toAddress}
          onChange={handleAddressChange}
          style={{ width: '90%', padding: '0.5rem', marginTop: '0.5rem' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button
          data-testid={dataTestIds.testPage.sendSol.signTransaction}
          onClick={signOnly}
          disabled={!publicKey}
          loading={loading}
        >
          Sign Transaction
        </Button>
        <Button
          data-testid={dataTestIds.testPage.sendSol.sendTransaction}
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
          <pre data-testid={dataTestIds.testPage.sendSol.signedTransaction} className="signedTransactions">
            {Buffer.from(signedTransaction?.signatures[0].signature!).toString('base64')}
          </pre>
        </>
      )}

      {transactionHash && (
        <>
          <h3>Transaction</h3>
          <TransactionHash data-testid={dataTestIds.testPage.sendSol.transactionHash} hash={transactionHash} />
        </>
      )}
    </div>
  );
};
