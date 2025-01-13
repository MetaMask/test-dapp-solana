import { SOLANA_DEVNET_CHAIN, SOLANA_MAINNET_CHAIN, SOLANA_TESTNET_CHAIN } from '@solana/wallet-standard-chains';
import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
  type SolanaSignAndSendTransactionMethod,
  SolanaSignMessage,
  type SolanaSignMessageFeature,
  type SolanaSignMessageMethod,
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
  type SolanaSignTransactionMethod,
} from '@solana/wallet-standard-features';
import type { IdentifierArray, Wallet, WalletAccount, WalletIcon, WalletVersion } from '@wallet-standard/base';
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
import { registerWallet } from '@wallet-standard/wallet';
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

export class MetaMaskWallet implements Wallet {
  readonly #listeners: { [E in StandardEventsNames]?: StandardEventsListeners[E][] } = {};
  readonly version: WalletVersion = '1.0.0';
  readonly name = 'MetaMask (registered Wallet)';
  readonly icon: WalletIcon = icon;
  readonly chains: IdentifierArray = [SOLANA_MAINNET_CHAIN, SOLANA_DEVNET_CHAIN, SOLANA_TESTNET_CHAIN];

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

  get accounts(): WalletAccount[] {
    return this.metaMaskSdk ? this.metaMaskSdk.accounts : [];
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
    }

    return { accounts: this.accounts };
  };

  #disconnect: StandardDisconnectMethod = async () => {
    // await this.metaMaskSdk.disconnect();
  };

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (/* ...inputs */) => {
    // return await this.metaMaskSdk?.startSendTransactionFlow(...inputs);
    return await new Promise((_, reject) => reject(new Error('Not implemented')));
  };

  #signTransaction: SolanaSignTransactionMethod = async (/* ...inputs */) => {
    // return await this.metaMaskSdk.standardSignTransaction(...inputs);
    return await new Promise((_, reject) => reject(new Error('Not implemented')));
  };

  #signMessage: SolanaSignMessageMethod = async (/* ...inputs */) => {
    // return await this.metaMaskSdk.standardSignMessage(/* ...inputs */);
    return await new Promise((_, reject) => reject(new Error('Not implemented')));
  };
}
