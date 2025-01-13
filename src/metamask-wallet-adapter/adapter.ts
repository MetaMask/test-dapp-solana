import type { WalletName } from '@solana/wallet-adapter-base';
import {
  BaseMessageSignerWalletAdapter,
  WalletConnectionError,
  WalletDisconnectedError,
  WalletDisconnectionError,
  WalletNotConnectedError,
  WalletPublicKeyError,
  WalletReadyState,
  WalletSendTransactionError,
  WalletSignMessageError,
  WalletSignTransactionError,
  isVersionedTransaction,
  type SendTransactionOptions,
} from '@solana/wallet-adapter-base';
import type { Transaction, TransactionVersion, VersionedTransaction } from '@solana/web3.js';
import { PublicKey, type Connection, type TransactionSignature } from '@solana/web3.js';
import type { default as Solflare } from '@solflare-wallet/sdk';
import { MetaMaskSdk } from '../sdk/sdk';
import { icon } from './icon';

export class MetaMaskWalletAdapter extends BaseMessageSignerWalletAdapter {
  name = 'MetaMask (WalletAdapter)' as WalletName;
  url = 'https://metamask.io';
  icon = icon;
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set(['legacy', 0]);

  private sdk: MetaMaskSdk | null = null;
  private _connecting = false;
  private _wallet: Solflare | null = null;
  private _publicKey: PublicKey | null = null;
  private _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  constructor() {
    super();
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this._handleMessage.bind(this));
    }
    if (this._readyState !== WalletReadyState.Unsupported) {
      this.sdk = new MetaMaskSdk();

      this.initReadyState();
    } else {
      console.warn('not initializing MetaMaskSdk');
    }
  }

  get publicKey() {
    return this._publicKey;
  }

  get connecting() {
    return this._connecting;
  }

  get connected() {
    return !!this._wallet?.connected;
  }

  get readyState() {
    return this._readyState;
  }

  async _handleMessage(event: MessageEvent) {
    if (event.data && event.data.type === 'moongate') {
      const { command } = event.data;
      if (command === 'disconnect') {
        this._connecting = false;
        await this.disconnect();
      }
    }
  }

  initReadyState() {
    const isMetamaskInstalled = window.ethereum?.isMetaMask; // TODO: not enough to ensure MetaMask is installed. For correct usage, refer to https://github.com/MetaMask/metamask-sdk/blob/f4dacaa5f028f2ae68962b028f549b8622f0aeb7/packages/sdk/src/services/MetaMaskSDK/InitializerManager/setupExtensionPreferences.ts#L47-L50

    if (isMetamaskInstalled) {
      this._readyState = WalletReadyState.Installed;
    }
  }

  async connect(): Promise<void> {
    if (this.sdk === null) {
      throw new WalletConnectionError('MetaMask SDK not initialized');
    }

    this._connecting = true;

    try {
      await this.sdk.connect();

      this._publicKey = await this.sdk.getPublicKey();

      if (this._publicKey) {
        this.emit('connect', this._publicKey);
      } else {
        console.warn('MetaMask public key not found. Please check your MetaMask installation or create an account.');
      }
    } catch (error: any) {
      console.error('Error encountered during connection:', error);
      throw new WalletConnectionError((error as Error).message);
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.sdk) {
      try {
        await this.sdk.disconnect();
        this._publicKey = null;
        this._connecting = false;
        window.removeEventListener('message', this._handleMessage.bind(this));

        this.emit('disconnect');
      } catch (error: any) {
        throw new WalletDisconnectionError(error?.message, error);
      }
    }
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    connection: Connection,
    options: SendTransactionOptions = {},
  ): Promise<TransactionSignature> {
    try {
      try {
        const { signers, ...sendOptions } = options;

        if (isVersionedTransaction(transaction)) {
          signers?.length && transaction.sign(signers);
        } else {
          transaction = (await this.prepareTransaction(transaction, connection, sendOptions)) as T;
          signers?.length && (transaction as Transaction).partialSign(...signers);
        }

        sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

        return await this.sdk?.startSendTransactionFlow();
      } catch (error: any) {
        if (error instanceof WalletConnectionError) {
          throw error;
        }
        throw new WalletSendTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const wallet = this._wallet;
      if (!wallet) {
        throw new WalletNotConnectedError();
      }

      try {
        return ((await wallet.signTransaction(transaction)) as T) || transaction;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    try {
      const wallet = this._wallet;
      if (!wallet) {
        throw new WalletNotConnectedError();
      }

      try {
        return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
      } catch (error: any) {
        throw new WalletSignTransactionError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      if (!wallet) {
        throw new WalletNotConnectedError();
      }

      try {
        return await wallet.signMessage(message, 'utf8');
      } catch (error: any) {
        throw new WalletSignMessageError(error?.message, error);
      }
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    }
  }

  private _disconnected = () => {
    console.log('event: disconnected');

    const wallet = this._wallet;
    if (wallet) {
      wallet.off('disconnect', this._disconnected);

      this._wallet = null;
      this._publicKey = null;

      this.emit('error', new WalletDisconnectedError());
      this.emit('disconnect');
    }
  };

  private _accountChanged = (newPublicKey?: PublicKey) => {
    if (!newPublicKey) {
      return;
    }

    const publicKey = this._publicKey;
    if (!publicKey) {
      return;
    }

    try {
      newPublicKey = new PublicKey(newPublicKey.toBytes());
    } catch (error: any) {
      this.emit('error', new WalletPublicKeyError(error?.message, error));
      return;
    }

    if (publicKey.equals(newPublicKey)) {
      return;
    }

    this._publicKey = newPublicKey;
    this.emit('connect', newPublicKey);
  };
}
