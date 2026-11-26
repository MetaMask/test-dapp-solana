import { getChainForEndpoint } from '@solana/wallet-standard-util';
import type { FC } from 'react';

import { useEndpoint } from '../context/EndpointProvider';
import { SolscanShort } from './SolscanShort';

type AccountProps = {
  account: string;
};

/**
 * Get the Solscan URL for an account based on the endpoint.
 *
 * @param endpoint - The current RPC endpoint.
 * @param account - The account address.
 * @returns The Solscan account URL, or `undefined` on unsupported chains.
 */
const getSolscanAccountUrl = (
  endpoint: string,
  account: string,
): string | undefined => {
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
 * Account component.
 * Displays a Solana account address with a link to its Solscan page.
 *
 * @param props - The component properties.
 * @param props.account - The Solana account address.
 * @returns The rendered account element.
 */
export const Account: FC<AccountProps> = ({ account, ...props }) => {
  const { endpoint } = useEndpoint();

  return (
    <SolscanShort
      {...props}
      content={account}
      solscanUrl={getSolscanAccountUrl(endpoint, account)}
    />
  );
};
