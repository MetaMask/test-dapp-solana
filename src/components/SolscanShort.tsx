import type { FC } from 'react';
import { useEffect, useState } from 'react';

type SolscanShortProps = {
  content: string;
  solscanUrl?: string;
};

export const SolscanShort: FC<SolscanShortProps> = ({
  content,
  solscanUrl,
  ...props
}) => {
  const [copied, setCopied] = useState(false);
  const [label, setLabel] = useState('');

  const copyToClipboard = (): void => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    setLabel(`${content.slice(0, 4)}...${content.slice(-4)}`);
  }, [content]);

  return (
    <div
      {...props}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: ' 8px',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      {solscanUrl ? (
        <a
          className="content"
          href={solscanUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ) : (
        <span className="content">{label}</span>
      )}
      <span
        onClick={copyToClipboard}
        onKeyDown={(keyEvent) => keyEvent.key === 'Enter' && copyToClipboard()}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {copied ? (
          <span style={{ fontSize: '0.8em', color: 'green' }}>Copied!</span>
        ) : (
          <span>📋</span>
        )}
      </span>
    </div>
  );
};
