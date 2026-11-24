import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import type {
  Connection,
  Finality,
  TransactionInstruction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { WSOL_MINT } from '../config';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  decodeMintAccount,
  getAssociatedTokenAddress,
} from '../splToken';
import { dataTestIds, defaultAddresses } from '../test';
import { Button } from './Button';
import { TransactionHash } from './TransactionHash';

/**
 * Converts an amout of lamports to SOL.
 *
 * @param lamports - The amount of lamports.
 * @returns The equivalent amount in SOL.
 */
export function lamportsToSol(lamports: bigint | number | string): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

/**
 * Converts an amout of sol to LAMPORTS.
 *
 * @param sol - The amount of SOL.
 * @returns The equivalent amount in lamports.
 */
export function solToLamports(sol: number): bigint {
  return BigInt(sol * LAMPORTS_PER_SOL);
}

/**
 * The properties of an SPL mint account.
 */
export type TokenProperties = {
  mintable: boolean;
  mintAuthority: PublicKey | null;
  supply: bigint;
  decimals: number;
  isInitialized: boolean;
  freezeable: boolean;
  freezeAuthority: PublicKey | null;
};

/**
 * Get the properties of a token.
 *
 * @param connection - The connection to the Solana cluster.
 * @param mint - The mint of the token.
 * @param commitment - The commitment level to use for the account query.
 * @returns The properties of the token mint.
 */
export async function getTokenProperties(
  connection: Connection,
  mint: PublicKey | string,
  commitment: Finality = 'confirmed',
): Promise<TokenProperties> {
  const mintKey = typeof mint === 'string' ? new PublicKey(mint) : mint;
  const accountInfo = await connection.getAccountInfo(mintKey, commitment);

  if (!accountInfo?.data) {
    throw new Error('Failed to fetch account data');
  }

  const deserialize = decodeMintAccount(new Uint8Array(accountInfo.data));

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
 *
 * @param fromPublicKey - The sender's public key.
 * @param toPublicKey - The recipient's public key.
 * @param amount - The amount of tokens to transfer.
 * @param connection - The connection to the Solana cluster.
 * @returns The transfer instructions.
 */
async function getTokenTransferInstruction(
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  amount: number,
  connection: Connection,
): Promise<TransactionInstruction[]> {
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

  const amountInLamports = Math.round(
    amount * 10 ** mintTokenProperties.decimals,
  );

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
 *
 * @returns The rendered Send WSOL element.
 */
export const SendWSol: FC = (): JSX.Element => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions, sendTransaction } =
    useWallet();
  const [signedTransactions, setSignedTransactions] = useState<
    VersionedTransaction[]
  >([]);
  const [sentTransactions, setSentTransactions] = useState<string[]>([]);
  const [nbRandomAddress, setNbRandomAddress] = useState(2);
  const [amount, setAmount] = useState(0.001);
  const [inMultipleTransactions, setInMultipleTransactions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle the change of the number of random addresses.
   */
  const handleNbRandomAddressChange = useCallback(
    (numberEvent: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(
        1,
        Math.min(Number(numberEvent.target.value), defaultAddresses.length),
      );
      setNbRandomAddress(value);
    },
    [],
  );

  /**
   * Handle the change of the checkbox to send one transaction by transfer.
   */
  const handleInMultipleTransactionsChange = useCallback(
    (checkboxEvent: React.ChangeEvent<HTMLInputElement>) => {
      setInMultipleTransactions(checkboxEvent.target.checked);
    },
    [],
  );

  /**
   * Generate a list of transactions to send WSOL to predefined addresses.
   *
   * @returns The generated transactions.
   */
  const getTransactions = useCallback(async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setSignedTransactions([]);

    const selectedAddresses = defaultAddresses
      .slice(0, nbRandomAddress)
      .map((address) => new PublicKey(address));

    console.log('Selected addresses:', selectedAddresses[0].toBase58());

    const latestBlockhash = await connection.getLatestBlockhash('confirmed');

    if (inMultipleTransactions) {
      return await Promise.all(
        selectedAddresses.map(async (toPubkey) => {
          const messageV0 = new TransactionMessage({
            payerKey: publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions: await getTokenTransferInstruction(
              publicKey,
              toPubkey,
              amount,
              connection,
            ),
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
            async (toPubkey) =>
              await getTokenTransferInstruction(
                publicKey,
                toPubkey,
                amount,
                connection,
              ),
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
      const signed =
        transactions.length === 1
          ? [await signTransaction(transactions[0])]
          : await signAllTransactions(transactions);

      setSignedTransactions(signed);
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
    } catch (sendError) {
      console.error('Error sending transaction:', sendError);
      setError('Error sending transaction');
    } finally {
      setLoading(false);
    }
  }, [sendTransaction, getTransactions, connection]);

  return (
    <div data-testid={dataTestIds.testPage.sendWSol.id}>
      <p>Send WSOL to X addresses</p>
      <form
        onSubmit={(formEvent) => formEvent.preventDefault()} // Prevent page reload
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            X addresses:
            <input
              data-testid={dataTestIds.testPage.sendWSol.nbAddresses}
              type="text"
              style={{
                width: '50%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                marginLeft: '0.5rem',
              }}
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
              style={{
                width: '50%',
                padding: '0.5rem',
                marginTop: '0.5rem',
                marginLeft: '0.5rem',
              }}
              type="text"
              placeholder="Amount In Sol"
              value={amount}
              onChange={(amountEvent) =>
                setAmount(Number(amountEvent.target.value))
              }
            />
          </label>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              data-testid={dataTestIds.testPage.sendWSol.signTransaction}
              onClick={() => {
                signOnly().catch(console.error);
              }}
              disabled={!publicKey}
              loading={loading}
            >
              Sign Transaction
            </Button>
            <Button
              data-testid={dataTestIds.testPage.sendWSol.sendTransaction}
              onClick={() => {
                signAndSend().catch(console.error);
              }}
              disabled={!publicKey}
              loading={loading}
            >
              Sign and Send Transaction
            </Button>
          </div>
        </div>

        {error ? <p style={{ color: 'red' }}>{error}</p> : null}

        {signedTransactions.length >= 1 && (
          <>
            <h3>Signed transactions</h3>
            <pre
              data-testid={dataTestIds.testPage.sendWSol.signedTransactions}
              className="signedTransactions"
            >
              {signedTransactions
                .map((tx) => Buffer.from(tx.signatures[0]).toString('base64'))
                .join('\n')}
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
