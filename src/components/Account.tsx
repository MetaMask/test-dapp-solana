import type { FC } from 'react';
import { SOLSCAN_ACCOUNT_URL } from '../config';
import { SolscanShort } from './SolscanShort';

interface AccountProps {
  account: string;
}

export const Account: FC<AccountProps> = ({ account }) => {
  return <SolscanShort content={account} solscanUrl={SOLSCAN_ACCOUNT_URL.replace('__ACCOUNT__', account)} />;
};
