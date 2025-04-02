import type { FC } from 'react';
import { SOLSCAN_TX_URL } from '../config';
import { SolscanShort } from './SolscanShort';

interface TransactionHashProps {
  hash: string;
}

export const TransactionHash: FC<TransactionHashProps> = ({ hash }) => {
  return <SolscanShort content={hash} solscanUrl={SOLSCAN_TX_URL.replace('__HASH__', hash)} />;
};
