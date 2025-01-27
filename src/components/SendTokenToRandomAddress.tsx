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
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey, type RpcResponseAndContext, type SimulatedTransactionResponse } from '@solana/web3.js';
import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

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
async function getTokenTransfertInstruction(
  fromPublicKey: PublicKey,
  toPublicKey: PublicKey,
  amount: number,
  connection: Connection,
) {
  const mintTokenAddress = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC
  const mintTokenProperties = await getTokenProperties(connection, mintTokenAddress);

  const fromAssociatedTokenAddress = await getAssociatedTokenAddress(
    mintTokenAddress,
    fromPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  const toAssociatedTokenAddress = await getAssociatedTokenAddress(
    mintTokenAddress,
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
      mintTokenAddress,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createTransferCheckedInstruction(
      fromAssociatedTokenAddress,
      mintTokenAddress,
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
 * Send Token to random addresses.
 */
export const SendTokenToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction, signAllTransactions } = useWallet();
  const [transactions, setTransactions] = useState<VersionedTransaction[]>([]);
  const [addresses, setAddresses] = useState<PublicKey[]>([]);
  const [parsedTransaction, setParsedTransaction] = useState<RpcResponseAndContext<SimulatedTransactionResponse>[]>([]);
  const defaultNbRandomAddress = 1;
  const defaultAmount = 0.1;
  const [nbRandomAddress, setNbRandomAddress] = useState(defaultNbRandomAddress);
  const [amount, setAmount] = useState(defaultAmount);
  const [inMultipleTransactions, setInMultipleTransactions] = useState(false);

  /**
   * Generate a list of transactions to send WSOL to random addresses.
   */
  const generateTransactions = useCallback(async () => {
    setParsedTransaction([]);

    const tmpAddresses = Array.from({ length: nbRandomAddress }, () => Keypair.generate().publicKey);
    setAddresses(tmpAddresses);

    if (!publicKey) {
      return;
    }

    const latestBlockhash = await connection.getLatestBlockhash('confirmed');

    console.log('inMultipleTransactions', inMultipleTransactions);

    if (inMultipleTransactions) {
      setTransactions(
        await Promise.all(
          tmpAddresses.map(async (toPubkey) => {
            const messageV0 = new TransactionMessage({
              payerKey: publicKey,
              recentBlockhash: latestBlockhash.blockhash,
              instructions: await getTokenTransfertInstruction(publicKey, toPubkey, amount, connection),
            }).compileToV0Message();
            const transaction = new VersionedTransaction(messageV0);

            return transaction;
          }),
        ),
      );
    } else {
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: (
          await Promise.all(
            tmpAddresses.map(
              async (toPubkey) => await getTokenTransfertInstruction(publicKey, toPubkey, amount, connection),
            ),
          )
        ).flat(),
      }).compileToV0Message();
      setTransactions([new VersionedTransaction(messageV0)]);
    }
  }, [publicKey, connection, nbRandomAddress, amount, inMultipleTransactions]);

  /**
   * Sign all transactions.
   */
  const signTransactions = useCallback(async () => {
    try {
      if (!signTransaction || !signAllTransactions) {
        throw new Error('Wallet does not support transaction signing!');
      }

      const signedTransactions = await signAllTransactions(transactions);

      const results = [];
      for (const transaction of signedTransactions) {
        const result = await connection.simulateTransaction(transaction, {
          commitment: 'confirmed',
          // innerInstructions: true,
          accounts: {
            encoding: 'base64',
            addresses: addresses.map((address) => address.toBase58()).concat(publicKey?.toBase58() as string),
            // addresses: [],
          },
        });

        results.push(result);
      }

      setParsedTransaction(results);
    } catch (error: any) {
      console.error('error', `Transaction signing failed! ${error?.message}`);
    }
  }, [signTransaction, signAllTransactions, transactions, connection, addresses, publicKey]);

  // Generate the list of transaction each time the value of the form change
  useEffect(() => {
    generateTransactions();
  }, [generateTransactions]);

  if (!connected) {
    return (
      <>
        <p>Please connect your wallet</p>
      </>
    );
  }

  return (
    <>
      <h1>Send USDC to X random addresses</h1>
      <form>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label>
            X random addresses
            <input
              type="text"
              placeholder="Nb random Addresses"
              value={nbRandomAddress}
              onChange={(e) => setNbRandomAddress(Number(e.target.value))}
            />
          </label>
          {nbRandomAddress > 1 ? (
            <label>
              In multiple transactions ?
              <input
                type="checkbox"
                checked={inMultipleTransactions}
                onChange={(e) => setInMultipleTransactions(e.target.checked)}
              />
            </label>
          ) : null}
          <label>
            Amount In USDC
            <input
              type="text"
              placeholder="Amount In Sol"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>
          <button type="button" onClick={signTransactions}>
            Sign and simulate {inMultipleTransactions ? nbRandomAddress : 1} transactions
          </button>
        </div>

        {parsedTransaction.length >= 1 && (
          <>
            <h3>Simulated transactions</h3>
            <pre>{JSON.stringify(parsedTransaction, undefined, 4)}</pre>
          </>
        )}
      </form>
    </>
  );
};
