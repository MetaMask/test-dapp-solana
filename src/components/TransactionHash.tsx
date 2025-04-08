import type { FC } from 'react';
import { getChainForEndpoint } from '@solana/wallet-standard-util';
import { useEndpoint } from '../context/EndpointProvider';
import { SolscanShort } from './SolscanShort';

interface TransactionHashProps {
  hash: string;
}

/**
 * Get the Solscan URL for a transaction hash based on the endpoint
 */
const getSolscanTxUrl = (endpoint: string, hash: string): string | undefined => {
  const chain = getChainForEndpoint(endpoint);
  if (chain === 'solana:mainnet') {
    return `https://solscan.io/tx/${hash}`;
  }

  if (chain === 'solana:devnet') {
    return `https://solscan.io/tx/${hash}?cluster=devnet`;
  }

  return undefined;
};

/**
 * TransactionHash component
 */
export const TransactionHash: FC<TransactionHashProps> = ({ hash }) => {
  const { endpoint } = useEndpoint();

  return (
    <SolscanShort
      content={hash}
      solscanUrl={getSolscanTxUrl(endpoint, hash)}
    />
  );
};
