import {
  SOLANA_DEVNET_CHAIN,
  SOLANA_MAINNET_CHAIN,
  SOLANA_TESTNET_CHAIN,
  type SolanaChain,
} from '@solana/wallet-standard-chains';
import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignAndSendTransactionMethod,
  SolanaSignIn,
  type SolanaSignInFeature,
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  type SolanaSignMessageMethod,
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
  type SolanaSignTransactionMethod,
} from '@solana/wallet-standard-features';
import type { Wallet, WalletIcon, WalletVersion } from '@wallet-standard/base';
import {
  StandardConnect,
  type StandardConnectFeature,
  type StandardConnectMethod,
  StandardDisconnect,
  type StandardDisconnectFeature,
  type StandardDisconnectMethod,
  StandardEvents,
  type StandardEventsFeature,
  type StandardEventsListeners,
  type StandardEventsNames,
  type StandardEventsOnMethod,
} from '@wallet-standard/features';
import { ReadonlyWalletAccount, registerWallet } from '@wallet-standard/wallet';
import { icon } from './icon';
import { MetaMaskSdk } from '../sdk/sdk';
import { detectProvider } from '../sdk/detectProvider';

let registered = false;

export async function registerMetaMaskWalletAdapter() {
  if (registered) {
    return;
  }
  registered = true;

  try {
    const detected = await detectProvider();

    if (detected) {
      registerWallet(new MetaMaskWallet());
      registered = true;
    }
  } catch (error) {
    console.error(error);
    registered = false;
  }
}

export class MetaMaskWalletAccount extends ReadonlyWalletAccount {
  constructor({
    address,
    publicKey,
    chains,
  }: {
    address: string;
    publicKey: Uint8Array;
    chains: readonly SolanaChain[];
  }) {
    const features: (keyof (SolanaSignAndSendTransactionFeature &
      SolanaSignTransactionFeature &
      SolanaSignMessageFeature &
      SolanaSignInFeature))[] = [SolanaSignAndSendTransaction, SolanaSignTransaction, SolanaSignMessage, SolanaSignIn];
    super({ address, publicKey, chains, features });
    if (new.target === MetaMaskWalletAccount) {
      Object.freeze(this);
    }
  }
}

export class MetaMaskWallet implements Wallet {
  readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};
  readonly version: WalletVersion = '1.0.0';
  readonly name = 'MetaMask (registered Wallet)';
  readonly icon: WalletIcon = icon;
  readonly chains: SolanaChain[] = [SOLANA_MAINNET_CHAIN, SOLANA_DEVNET_CHAIN, SOLANA_TESTNET_CHAIN];
  #account: MetaMaskWalletAccount | undefined;

  metaMaskSdk: MetaMaskSdk;

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature {
    return {
      [StandardConnect]: {
        version: this.version,
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: this.version,
        disconnect: this.#disconnect,
      },
      [StandardEvents]: {
        version: this.version,
        on: this.#on,
      },
      [SolanaSignAndSendTransaction]: {
        version: this.version,
        supportedTransactionVersions: ['legacy', 0],
        signAndSendTransaction: this.#signAndSendTransaction,
      },
      [SolanaSignTransaction]: {
        version: this.version,
        supportedTransactionVersions: ['legacy', 0],
        signTransaction: this.#signTransaction,
      },
      [SolanaSignMessage]: {
        version: this.version,
        signMessage: this.#signMessage,
      },
    };
  }

  get accounts() {
    return this.#account ? [this.#account] : [];
  }

  constructor() {
    this.metaMaskSdk = new MetaMaskSdk();
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    if (this.#listeners[event]) {
      this.#listeners[event].push(listener);
    } else {
      this.#listeners[event] = [listener];
    }
    return (): void => this.#off(event, listener);
  };

  #emit<E extends StandardEventsNames>(event: E, ...args: Parameters<StandardEventsListeners[E]>): void {
    for (const listener of this.#listeners[event] || []) {
      listener.apply(null, args);
    }
  }

  #off<E extends StandardEventsNames>(event: E, listener: StandardEventsListeners[E]): void {
    this.#listeners[event] = this.#listeners[event]?.filter((existingListener) => listener !== existingListener);
  }

  #connect: StandardConnectMethod = async () => {
    if (!this.accounts.length) {
      await this.metaMaskSdk.connect();

      const address = this.metaMaskSdk.accounts[0].address;
      const publicKey = new Uint8Array(Buffer.from(address, 'hex'));

      this.#account = new MetaMaskWalletAccount({
        address: this.metaMaskSdk.accounts[0].address,
        publicKey,
        chains: this.chains,
      });
    }

    return { accounts: this.accounts };
  };

  #disconnect: StandardDisconnectMethod = async () => {
    // await this.metaMaskSdk.disconnect();
  };

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (/* ...inputs */) => {
    return await this.metaMaskSdk?.startSendTransactionFlow();
    // return await new Promise((_, reject) => reject(new Error('signAndSendTransaction: Not implemented')));
  };

  #signTransaction: SolanaSignTransactionMethod = async (/* ...inputs */) => {
    // return await this.metaMaskSdk.standardSignTransaction(...inputs);
    return await new Promise((_, reject) => reject(new Error('signTransaction: Not implemented')));
  };

  #signMessage: SolanaSignMessageMethod = async (/* ...inputs */) => {
    // return await this.metaMaskSdk.standardSignMessage(/* ...inputs */);
    return await new Promise((_, reject) => reject(new Error('signMessage: Not implemented')));
  };
}
