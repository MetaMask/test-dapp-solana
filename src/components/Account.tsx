import { getChainForEndpoint } from '@solana/wallet-standard-util';
import type { FC } from 'react';
import { useEndpoint } from '../context/EndpointProvider';
import { SolscanShort } from './SolscanShort';

interface AccountProps {
  account: string;
}

/**
 * Get the Solscan URL for an account based on the endpoint
 */
const getSolscanAccountUrl = (endpoint: string, account: string): string | undefined => {
  const chain = getChainForEndpoint(endpoint);
  if (chain === 'solana:mainnet') {
    return `https://solscan.io/account/${account}`;
  }

  if (chain === 'solana:devnet') {
    return `https://solscan.io/account/${account}?cluster=devnet`;
  }

  return undefined;
};

/**
 * Account component
 * Displays a Solana account address with a link to its Solscan page
 */
export const Account: FC<AccountProps> = ({ account }) => {
  const { endpoint } = useEndpoint();

  return <SolscanShort content={account} solscanUrl={getSolscanAccountUrl(endpoint, account)} />;
};
