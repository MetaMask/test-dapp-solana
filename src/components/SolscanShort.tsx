import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface SolscanShortProps {
  content: string;
  solscanUrl?: string;
}

export const SolscanShort: FC<SolscanShortProps> = ({ content, solscanUrl }) => {
  const [copied, setCopied] = useState(false);
  const [label, setLabel] = useState('');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    setLabel(content.slice(0, 4) + '...' + content.slice(-4));
  }, [content]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: ' 8px',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      {
        solscanUrl ? (
          <a href={solscanUrl} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ): (
          <span>
            {label}
          </span>
        )
      }
      <span
        onClick={copyToClipboard}
        onKeyDown={(e) => e.key === 'Enter' && copyToClipboard()}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {copied ? <span style={{ fontSize: '0.8em', color: 'green' }}>Copied!</span> : <span>📋</span>}
      </span>
    </div>
  );
};
