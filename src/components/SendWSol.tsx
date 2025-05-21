import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  type Connection,
  type Finality,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import type { FC } from 'react';
import { useCallback, useState } from 'react';
import { WSOL_MINT } from '../config';
import { dataTestIds, defaultAddresses } from '../test';
import { Button } from './Button';
import { TransactionHash } from './TransactionHash';

/**
 * Converts an amout of lamports to SOL.
 */
export function lamportsToSol(lamports: bigint | number | string): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

/**
 * Converts an amout of sol to LAMPORTS.
 */
export function solToLamports(sol: number): bigint {
  return BigInt(sol * LAMPORTS_PER_SOL);
}

/**
 * Get the properties of a token.
 */
export async function getTokenProperties(
  connection: Connection,
  mint: PublicKey | string,
  commitment: Finality = 'confirmed',
) {
  const mintKey = typeof mint === 'string' ? new PublicKey(mint) : mint;
  const accountInfo = await connection.getAccountInfo(mintKey, commitment);

  if (!accountInfo?.data) {
    throw new Error('Failed to fetch account data');
  }

  const deserialize = MintLayout.decode(new Uint8Array(accountInfo.data));

  return {
    mintable: deserialize.mintAuthorityOption === 0,
    mintAuthority: deserialize.mintAuthority,
    supply: deserialize.supply,
    decimals: deserialize.decimals,
    isInitialized: deserialize.isInitialized,
    freezeable: deserialize.freezeAuthorityOption !== 0,
    freezeAuthority: deserialize.freezeAuthority,
  };
}

/**
 * Get the instructions to send a token from one address to another.
 */
async function getTokenTransferInstruction(
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  amount: number,
  connection: Connection,
) {
  const mintTokenProperties = await getTokenProperties(connection, WSOL_MINT);

  const fromAssociatedTokenAddress = await getAssociatedTokenAddress(
    WSOL_MINT,
    fromPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const toAssociatedTokenAddress = await getAssociatedTokenAddress(
    WSOL_MINT,
    toPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );

  const amountInLamports = Math.round(amount * 10 ** mintTokenProperties.decimals);

  const instructions = [
    createAssociatedTokenAccountInstruction(
      fromPublicKey,
      toAssociatedTokenAddress,
      toPublicKey,
      WSOL_MINT,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createTransferCheckedInstruction(
      fromAssociatedTokenAddress,
      WSOL_MINT,
      toAssociatedTokenAddress,
      fromPublicKey,
      amountInLamports,
      mintTokenProperties.decimals,
      [],
      TOKEN_PROGRAM_ID,
    ),
  ];

  return instructions;
}

/**
 * Send Token to predefined addresses.
 */
export const SendWSol: FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions, sendTransaction } = useWallet();
  const [signedTransactions, setSignedTransactions] = useState<VersionedTransaction[]>([]);
  const [sentTransactions, setSentTransactions] = useState<string[]>([]);
  const [nbRandomAddress, setNbRandomAddress] = useState(1);
  const [amount, setAmount] = useState(0.1);
  const [inMultipleTransactions, setInMultipleTransactions] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Handle the change of the number of random addresses.
   */
  const handleNbRandomAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(Number(e.target.value), defaultAddresses.length));
    setNbRandomAddress(value);
  }, []);

  /**
   * Handle the change of the checkbox to send one transaction by transfer.
   */
  const handleInMultipleTransactionsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInMultipleTransactions(e.target.checked);
  }, []);

  /**
   * Generate a list of transactions to send WSOL to predefined addresses.
   */
  const getTransactions = useCallback(async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setSignedTransactions([]);

    const selectedAddresses = defaultAddresses.slice(0, nbRandomAddress).map((address) => new PublicKey(address));

    console.log('Selected addresses:', selectedAddresses[0].toBase58());

    const latestBlockhash = await connection.getLatestBlockhash('confirmed');

    if (inMultipleTransactions) {
      return await Promise.all(
        selectedAddresses.map(async (toPubkey) => {
          const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: await getTokenTransferInstruction(publicKey, toPubkey, amount, connection),
          }).compileToV0Message();
          const transaction = new VersionedTransaction(messageV0);

          return transaction;
        }),
      );
    }
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: (
        await Promise.all(
          selectedAddresses.map(
            async (toPubkey) => await getTokenTransferInstruction(publicKey, toPubkey, amount, connection),
          ),
        )
      ).flat(),
    }).compileToV0Message();

    return [new VersionedTransaction(messageV0)];
  }, [publicKey, connection, nbRandomAddress, amount, inMultipleTransactions]);

  /**
   * Sign the transaction.
   */
  const signOnly = useCallback(async () => {
    if (!signTransaction || !signAllTransactions) {
      throw new Error('Wallet does not support transaction signing!');
    }

    setLoading(true);
    try {
      const transactions = await getTransactions();
      const signedTransactions =
        transactions.length === 1 ? [await signTransaction(transactions[0])] : await signAllTransactions(transactions);

      setSignedTransactions(signedTransactions);
    } finally {
      setLoading(false);
    }
  }, [signTransaction, signAllTransactions, getTransactions]);

  /**
   * Sign and send the transaction.
   */
  const signAndSend = useCallback(async () => {
    if (!sendTransaction) {
      throw new Error('Wallet does not support sending transactions!');
    }

    setLoading(true);
    try {
      const transactions = await getTransactions();
      const transactionHashs = [];
      for (const transaction of transactions) {
        const transactionHash = await sendTransaction(transaction, connection);
        // await connection.confirmTransaction(transactionHash, 'confirmed'); // TODO: Disabled for E2E tests until local RPC is available
        transactionHashs.push(transactionHash);
      }

      setSentTransactions(transactionHashs);
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert('Error sending transaction');
    } finally {
      setLoading(false);
    }
  }, [sendTransaction, getTransactions, connection]);

  return (
    <div data-testid={dataTestIds.testPage.sendWSol.id}>
      <p>Send WSOL to X addresses</p>
      <form
        onSubmit={(e) => e.preventDefault()} // Prevent page reload
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            X addresses:
            <input
              data-testid={dataTestIds.testPage.sendWSol.nbAddresses}
              type="text"
              style={{ width: '50%', padding: '0.5rem', marginTop: '0.5rem', marginLeft: '0.5rem' }}
              max={10}
              min={1}
              placeholder="Nb random Addresses"
              value={nbRandomAddress}
              onChange={handleNbRandomAddressChange}
            />
          </label>
          {nbRandomAddress > 1 ? (
            <label>
              One transaction by transfer:
              <input
                data-testid={dataTestIds.testPage.sendWSol.multipleTransactions}
                type="checkbox"
                style={{ paddingLeft: '0.5rem', marginLeft: '0.5rem' }}
                checked={inMultipleTransactions}
                onChange={handleInMultipleTransactionsChange}
              />
            </label>
          ) : null}
          <label>
            Amount:
            <input
              data-testid={dataTestIds.testPage.sendWSol.amount}
              style={{ width: '50%', padding: '0.5rem', marginTop: '0.5rem', marginLeft: '0.5rem' }}
              type="text"
              placeholder="Amount In Sol"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              data-testid={dataTestIds.testPage.sendWSol.signTransaction}
              onClick={signOnly}
              disabled={!publicKey}
              loading={loading}
            >
              Sign Transaction
            </Button>
            <Button
              data-testid={dataTestIds.testPage.sendWSol.sendTransaction}
              onClick={signAndSend}
              disabled={!publicKey}
              loading={loading}
            >
              Sign and Send Transaction
            </Button>
          </div>
        </div>

        {signedTransactions.length >= 1 && (
          <>
            <h3>Signed transactions</h3>
            <pre data-testid={dataTestIds.testPage.sendWSol.signedTransactions} className="signedTransactions">
              {signedTransactions.map((tx) => Buffer.from(tx.signatures[0]).toString('base64')).join('\n')}
            </pre>
          </>
        )}

        {sentTransactions.length > 0 && (
          <>
            <h3>Transaction(s)</h3>
            <div data-testid={dataTestIds.testPage.sendWSol.transactionHashs}>
              {sentTransactions.map((txHash) => (
                <TransactionHash key={txHash} hash={txHash} />
              ))}
            </div>
          </>
        )}
      </form>
    </div>
  );
};
