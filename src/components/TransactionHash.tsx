import { getChainForEndpoint } from '@solana/wallet-standard-util';
import type { FC } from 'react';

import { useEndpoint } from '../context/EndpointProvider';
import { SolscanShort } from './SolscanShort';

type TransactionHashProps = {
  hash: string;
};

/**
 * Get the Solscan URL for a transaction hash based on the endpoint.
 *
 * @param endpoint - The current RPC endpoint.
 * @param hash - The transaction hash.
 * @returns The Solscan transaction URL, or `undefined` on unsupported chains.
 */
const getSolscanTxUrl = (
  endpoint: string,
  hash: string,
): string | undefined => {
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
 * TransactionHash component.
 * Displays a transaction hash with a link to its Solscan page.
 *
 * @param props - The component properties.
 * @param props.hash - The transaction hash.
 * @returns The rendered transaction hash element.
 */
export const TransactionHash: FC<TransactionHashProps> = ({
  hash,
  ...props
}) => {
  const { endpoint } = useEndpoint();

  return (
    <SolscanShort
      {...props}
      content={hash}
      solscanUrl={getSolscanTxUrl(endpoint, hash)}
    />
  );
};
