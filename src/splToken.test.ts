// @vitest-environment node
import { PublicKey } from '@solana/web3.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  createTransferCheckedInstruction,
  decodeMintAccount,
  getAssociatedTokenAddress,
} from './splToken';

/**
 * Expected values were generated with @solana/spl-token@0.4.13 itself (the
 * package this module replaces), so these tests verify byte-for-byte parity.
 */

const OWNER = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
const DESTINATION = new PublicKey(
  '3FePDjPzKd7ab6YGnsp9bxnaRxPpGntdYKiHYzyZ7Ton',
);
const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');
const EXPECTED_ATA = new PublicKey(
  '8LjUgMjzZuHj8VdyxzkmLLQVmW4C3gd56md1nLd76TNW',
);

describe('splToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAssociatedTokenAddress', () => {
    it('derives the same address as @solana/spl-token', async () => {
      const ata = await getAssociatedTokenAddress(
        WSOL_MINT,
        OWNER,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      expect(ata.toBase58()).toBe(EXPECTED_ATA.toBase58());
    });

    it('rejects off-curve owners', async () => {
      // The expected ATA is itself a PDA (off curve), so it works as an off-curve owner.
      await expect(
        getAssociatedTokenAddress(WSOL_MINT, EXPECTED_ATA, false),
      ).rejects.toThrow('Owner cannot sign: address is off curve');
    });
  });

  describe('createAssociatedTokenAccountInstruction', () => {
    it('matches the @solana/spl-token instruction', () => {
      const instruction = createAssociatedTokenAccountInstruction(
        OWNER,
        EXPECTED_ATA,
        OWNER,
        WSOL_MINT,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      );

      expect(instruction.programId).toStrictEqual(ASSOCIATED_TOKEN_PROGRAM_ID);
      expect(instruction.data).toHaveLength(0);
      expect(instruction.keys).toStrictEqual([
        { pubkey: OWNER, isSigner: true, isWritable: true },
        { pubkey: EXPECTED_ATA, isSigner: false, isWritable: true },
        { pubkey: OWNER, isSigner: false, isWritable: false },
        { pubkey: WSOL_MINT, isSigner: false, isWritable: false },
        { pubkey: PublicKey.default, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ]);
    });
  });

  describe('createTransferCheckedInstruction', () => {
    it('matches the @solana/spl-token instruction', () => {
      const instruction = createTransferCheckedInstruction(
        EXPECTED_ATA,
        WSOL_MINT,
        DESTINATION,
        OWNER,
        1_000_000_000n,
        9,
        [],
        TOKEN_PROGRAM_ID,
      );

      expect(instruction.programId).toStrictEqual(TOKEN_PROGRAM_ID);
      expect(Buffer.from(instruction.data).toString('hex')).toBe(
        '0c00ca9a3b0000000009',
      );
      expect(instruction.keys).toStrictEqual([
        { pubkey: EXPECTED_ATA, isSigner: false, isWritable: true },
        { pubkey: WSOL_MINT, isSigner: false, isWritable: false },
        { pubkey: DESTINATION, isSigner: false, isWritable: true },
        { pubkey: OWNER, isSigner: true, isWritable: false },
      ]);
    });

    it('keeps the multisig owner key and appends the signers', () => {
      const instruction = createTransferCheckedInstruction(
        EXPECTED_ATA,
        WSOL_MINT,
        DESTINATION,
        OWNER,
        1n,
        9,
        [OWNER, DESTINATION],
        TOKEN_PROGRAM_ID,
      );

      expect(instruction.keys).toStrictEqual([
        { pubkey: EXPECTED_ATA, isSigner: false, isWritable: true },
        { pubkey: WSOL_MINT, isSigner: false, isWritable: false },
        { pubkey: DESTINATION, isSigner: false, isWritable: true },
        { pubkey: OWNER, isSigner: false, isWritable: false },
        { pubkey: OWNER, isSigner: true, isWritable: false },
        { pubkey: DESTINATION, isSigner: true, isWritable: false },
      ]);
    });
  });

  describe('createSyncNativeInstruction', () => {
    it('matches the @solana/spl-token instruction', () => {
      const instruction = createSyncNativeInstruction(
        EXPECTED_ATA,
        TOKEN_PROGRAM_ID,
      );

      expect(instruction.programId).toStrictEqual(TOKEN_PROGRAM_ID);
      expect(Buffer.from(instruction.data).toString('hex')).toBe('11');
      expect(instruction.keys).toStrictEqual([
        { pubkey: EXPECTED_ATA, isSigner: false, isWritable: true },
      ]);
    });
  });

  describe('decodeMintAccount', () => {
    const buildMintData = (options: {
      mintAuthorityOption: number;
      freezeAuthorityOption: number;
      supply: bigint;
      decimals: number;
      isInitialized: boolean;
    }): Uint8Array => {
      const data = Buffer.alloc(82);
      data.writeUInt32LE(options.mintAuthorityOption, 0);
      const mintAuthority = Buffer.alloc(32, 0x11);
      mintAuthority.copy(data, 4);
      data.writeBigUInt64LE(options.supply, 36);
      data[44] = options.decimals;
      data[45] = options.isInitialized ? 1 : 0;
      data.writeUInt32LE(options.freezeAuthorityOption, 46);
      const freezeAuthority = Buffer.alloc(32, 0x22);
      freezeAuthority.copy(data, 50);
      return new Uint8Array(data);
    };

    it('decodes a mint account with both authorities set', () => {
      const decoded = decodeMintAccount(
        buildMintData({
          mintAuthorityOption: 1,
          freezeAuthorityOption: 1,
          supply: 12345678901234567890n,
          decimals: 9,
          isInitialized: true,
        }),
      );

      expect(decoded.mintAuthorityOption).toBe(1);
      expect(decoded.mintAuthority?.toBase58()).toBe(
        '29d2S7vB453rNYFdR5Ycwt7y9haRT5fwVwL9zTmBhfV2',
      );
      expect(decoded.supply).toBe(12345678901234567890n);
      expect(decoded.decimals).toBe(9);
      expect(decoded.isInitialized).toBe(true);
      expect(decoded.freezeAuthorityOption).toBe(1);
      expect(decoded.freezeAuthority?.toBase58()).toBe(
        new PublicKey(Buffer.alloc(32, 0x22)).toBase58(),
      );
    });

    it('decodes a mint account with no authorities', () => {
      const decoded = decodeMintAccount(
        buildMintData({
          mintAuthorityOption: 0,
          freezeAuthorityOption: 0,
          supply: 0n,
          decimals: 6,
          isInitialized: false,
        }),
      );

      expect(decoded.mintAuthority).toBeNull();
      expect(decoded.freezeAuthority).toBeNull();
      expect(decoded.isInitialized).toBe(false);
      expect(decoded.supply).toBe(0n);
    });

    it('rejects data of the wrong length', () => {
      expect(() => decodeMintAccount(new Uint8Array(81))).toThrow(
        'Invalid mint account data length: 81',
      );
    });
  });
});
