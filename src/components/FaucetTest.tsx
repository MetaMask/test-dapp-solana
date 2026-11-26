import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';

import { WSOL_MINT } from '../config';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
} from '../splToken';
import { dataTestIds } from '../test';
import { Button } from './Button';

const solAirDropAmount = 1; // Amount of SOL to airdrop
const wsolConversionAmount = 0.5; // Amount of SOL to convert to WSOL

export const FaucetTest: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [solBalance, setSolBalance] = useState<number>(0);
  const [wsolBalance, setWsolBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch SOL and WSOL balances.
   */
  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    const balance = await connection.getBalance(publicKey);
    setSolBalance(balance / 1_000_000_000); // Convert lamports to SOL

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      {
        mint: WSOL_MINT,
      },
    );

    // `parsed` is untyped in `@solana/web3.js`, so narrow it to the fields we use.
    const getUiAmount = (
      account: (typeof tokenAccounts.value)[number],
    ): number => {
      const parsed = account.account.data.parsed as {
        info: { tokenAmount: { uiAmount: number } };
      };
      return parsed.info.tokenAmount.uiAmount;
    };

    const wsolAccount = tokenAccounts.value.find(
      (account) => getUiAmount(account) > 0,
    );

    setWsolBalance(wsolAccount ? getUiAmount(wsolAccount) : 0);
  }, [connection, publicKey]);

  useEffect(() => {
    fetchBalances().catch(console.error);
  }, [fetchBalances]);

  /**
   * Request an airdrop of SOL.
   */
  const requestAirdrop = useCallback(async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const lamports = solAirDropAmount * 1_000_000_000; // 1 SOL
      const signature = await connection.requestAirdrop(publicKey, lamports);
      await connection.confirmTransaction(signature, 'confirmed');
      await fetchBalances();
    } catch (error) {
      console.error('Airdrop failed:', error);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, fetchBalances]);

  /**
   * Convert SOL to WSOL.
   */
  const convertToWsol = useCallback(async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    try {
      const lamports = wsolConversionAmount * 1_000_000_000; // 0.5 SOL

      const wsolAssociatedTokenAddress = await getAssociatedTokenAddress(
        WSOL_MINT,
        publicKey,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      const transaction = new Transaction();

      // Test if the account already exists; if not, create it
      const accountInfo = await connection.getAccountInfo(
        wsolAssociatedTokenAddress,
      );
      if (!accountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            wsolAssociatedTokenAddress,
            publicKey,
            WSOL_MINT,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID,
          ),
        );
      }

      // Transfer SOL to the WSOL ATA
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: wsolAssociatedTokenAddress,
          lamports,
        }),
      );

      // Sync the SOL to WSOL
      transaction.add(createSyncNativeInstruction(wsolAssociatedTokenAddress));

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      await connection.confirmTransaction(signature, 'confirmed');
      await fetchBalances();
    } catch (error) {
      console.error('Conversion to WSOL failed:', error);
    } finally {
      setLoading(false);
    }
  }, [sendTransaction, connection, publicKey, fetchBalances]);

  return (
    <div data-testid={dataTestIds.testPage.faucet.id}>
      <p>SOL Balance: {solBalance.toFixed(2)} SOL</p>
      <p>WSOL Balance: {wsolBalance.toFixed(2)} WSOL</p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button
          data-testid={dataTestIds.testPage.faucet.getSol}
          onClick={() => {
            requestAirdrop().catch(console.error);
          }}
          disabled={!publicKey}
          loading={loading}
        >
          {`Get ${solAirDropAmount} SOL`}
        </Button>
        {solBalance > 0 && (
          <Button
            data-testid={dataTestIds.testPage.faucet.convertSolToWsol}
            onClick={() => {
              convertToWsol().catch(console.error);
            }}
            disabled={!publicKey}
            loading={loading}
          >
            {`Convert ${wsolConversionAmount} SOL to WSOL`}
          </Button>
        )}
      </div>
    </div>
  );
};
