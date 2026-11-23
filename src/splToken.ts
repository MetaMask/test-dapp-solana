import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';

/**
 * Minimal replacements for the parts of the legacy `@solana/spl-token`
 * package used by this dapp. That package is unmaintained and pulls in a
 * vulnerable `bigint-buffer` dependency; these helpers implement the same
 * stable, spec-defined encodings with no extra dependencies.
 *
 * See https://github.com/MetaMask/test-dapp-solana/issues/57
 */

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

/** Instruction discriminators from the SPL Token program spec. */
const TRANSFER_CHECKED_INSTRUCTION_INDEX = 12;
const SYNC_NATIVE_INSTRUCTION_INDEX = 17;

/** Byte length of a deserialized SPL mint account. */
const MINT_ACCOUNT_DATA_LENGTH = 82;

function u64ToLEBytes(value: number | bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt.asUintN(64, BigInt(value)), true);
  return bytes;
}

/**
 * Derive the associated token account address for a given mint and owner.
 */
export async function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<PublicKey> {
  if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer())) {
    throw new Error('Owner cannot sign: address is off curve');
  }

  const [address] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    associatedTokenProgramId,
  );
  return address;
}

/**
 * Build an instruction to create the associated token account owned by `owner`.
 */
export function createAssociatedTokenAccountInstruction(
  payer: PublicKey,
  associatedToken: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: associatedTokenProgramId,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: associatedToken, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: programId, isSigner: false, isWritable: false },
    ],
    // The ATA create instruction carries no data.
    data: Buffer.alloc(0),
  });
}

/**
 * Build a TransferChecked instruction (amount validated against mint decimals).
 */
export function createTransferCheckedInstruction(
  source: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number | bigint,
  decimals: number,
  multiSigners: PublicKey[] = [],
  programId = TOKEN_PROGRAM_ID,
): TransactionInstruction {
  const ownerKeys = multiSigners.length
    ? multiSigners.map((signer) => ({ pubkey: signer, isSigner: true, isWritable: false }))
    : [{ pubkey: owner, isSigner: true, isWritable: false }];

  // Encoded as u8 tag + u64 LE amount + u8 decimals.
  const data = new Uint8Array(10);
  data[0] = TRANSFER_CHECKED_INSTRUCTION_INDEX;
  data.set(u64ToLEBytes(amount), 1);
  data[9] = decimals;

  return new TransactionInstruction({
    programId,
    keys: [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
      ...ownerKeys,
    ],
    data: Buffer.from(data),
  });
}

/**
 * Build a SyncNative instruction to credit wrapped SOL with transferred lamports.
 */
export function createSyncNativeInstruction(account: PublicKey, programId = TOKEN_PROGRAM_ID): TransactionInstruction {
  return new TransactionInstruction({
    programId,
    keys: [{ pubkey: account, isSigner: false, isWritable: true }],
    // Encoded as a single u8 tag.
    data: Buffer.of(SYNC_NATIVE_INSTRUCTION_INDEX),
  });
}

/**
 * Deserialized fields of an SPL mint account.
 */
export type MintAccountData = {
  mintAuthorityOption: number;
  mintAuthority: PublicKey | null;
  supply: bigint;
  decimals: number;
  isInitialized: boolean;
  freezeAuthorityOption: number;
  freezeAuthority: PublicKey | null;
};

/**
 * Decode the 82-byte binary layout of an SPL mint account.
 */
export function decodeMintAccount(data: Uint8Array): MintAccountData {
  if (data.length !== MINT_ACCOUNT_DATA_LENGTH) {
    throw new Error(`Invalid mint account data length: ${data.length}`);
  }

  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const mintAuthorityOption = view.getUint32(0, true);
  const freezeAuthorityOption = view.getUint32(46, true);

  return {
    mintAuthorityOption,
    mintAuthority: mintAuthorityOption === 0 ? null : new PublicKey(data.slice(4, 36)),
    supply: view.getBigUint64(36, true),
    decimals: data[44],
    isInitialized: data[45] !== 0,
    freezeAuthorityOption,
    freezeAuthority: freezeAuthorityOption === 0 ? null : new PublicKey(data.slice(50, 82)),
  };
}
