import { useWallet } from '@solana/wallet-adapter-react';
import type { FC, ReactNode } from 'react';

interface TestProps {
  title: string;
  children: ReactNode;
}

export const Test: FC<TestProps> = ({ title, children }) => {
  const { connected } = useWallet();

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          color: '#ffffff',
          backgroundColor: '#512da8', // Arrière-plan pour le titre uniquement
          padding: '0.5rem 1rem',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>
      </div>
      <div style={{ padding: '1rem' }}>{connected ? children : <p>Not Connected</p>}</div>
    </div>
  );
};
