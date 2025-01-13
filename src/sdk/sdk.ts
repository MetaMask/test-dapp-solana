import { getSnapsProvider } from './config/metamask';
import type { MetaMaskInpageProvider } from '@metamask/providers';
import { defaultSnapOrigin } from './config/snap';
import { PublicKey } from '@solana/web3.js';

export class MetaMaskSdk {
  #provider: MetaMaskInpageProvider | undefined = undefined;
  #snapId: string = defaultSnapOrigin;
  #installedSnap = false;
  #accounts: any[] = [];

  constructor() {
    void this.#initializeProvider();
  }

  get accounts(): any[] {
    return this.#accounts;
  }

  get installedSnap() {
    return this.#installedSnap;
  }

  async #initializeProvider() {
    this.#provider = await getSnapsProvider();
  }

  async connect(): Promise<any[]> {
    console.log('connect: start');

    const requestSnaps = (await this.#provider?.request({
      method: 'wallet_requestSnaps',
      params: {
        [this.#snapId]: {},
      },
    })) as Record<string, string>;

    this.#installedSnap = !!requestSnaps[this.#snapId];

    this.#accounts = await this.getAccounts();

    console.log('connect: accounts', this.#accounts);

    return this.#accounts;
  }

  async disconnect(): Promise<void> {
    this.#accounts = [];
  }

  async getPublicKey(): Promise<PublicKey | null> {
    const accounts = await this.getAccounts();

    console.log('getPublicKey: accounts', accounts);

    if (accounts.length === 0) {
      return null;
    }

    console.log('getPublicKey: accounts[0].address', accounts?.[0].address);

    return accounts ? new PublicKey(accounts[0].address) : null;
  }

  async startSendTransactionFlow(): Promise<any | null> {
    const walletId = (await this.getAccounts())[0].id;

    await this.#provider?.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.#snapId,
        request: {
          method: 'startSendTransactionFlow',
          params: {
            scope: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
            account: walletId,
          },
        },
      },
    });
  }

  async getAccounts(): Promise<any[]> {
    const accounts = (await this.#provider?.request({
      method: 'wallet_invokeKeyring',
      params: {
        snapId: this.#snapId,
        request: {
          method: 'keyring_listAccounts',
        },
      },
    })) as any[];
    return accounts || [];
  }

  async getNetwork(): Promise<string> {
    return (await this.#provider?.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: this.#snapId,
        request: {
          method: 'eth_chainId',
          params: {},
        },
      },
    })) as string;
  }
}
