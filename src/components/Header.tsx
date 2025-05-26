import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getChainForEndpoint } from '@solana/wallet-standard-util';
import { type FC, useCallback, useState } from 'react';
import { useEndpoint } from '../context/EndpointProvider';
import { dataTestIds } from '../test';
import { Account } from './Account';

type HeaderProps = {};

const isValidUrl = (url: string): boolean => {
  const urlRegex = /^(http:\/\/|https:\/\/)?((localhost(:\d+)?|[\w-]+(\.[\w-]+)+)(:\d+)?)(\/.*)?$/i;
  return urlRegex.test(url);
};

/**
 * Header component
 */
export const Header: FC<HeaderProps> = () => {
  const { publicKey, connected } = useWallet();
  const { endpoint, setEndpoint } = useEndpoint();
  const [tempEndpoint, setTempEndpoint] = useState(endpoint);
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setTempEndpoint(event.target.value);
      setShowUpdateButton(event.target.value !== endpoint);
      setError(null); // Clear error on input change
    },
    [endpoint],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // Prevent default form submission behavior

      if (!isValidUrl(tempEndpoint)) {
        setError('Invalid URL format.');
        return;
      }

      try {
        const chain = getChainForEndpoint(tempEndpoint);
        if (!chain) {
          throw new Error('Invalid chain.');
        }
        setEndpoint(tempEndpoint);
        setShowUpdateButton(false);
        setError(null); // Clear error on successful update
      } catch {
        setError('Failed to determine chain for the provided endpoint.');
      }
    },
    [tempEndpoint, setEndpoint],
  );

  return (
    <div
      data-testid={dataTestIds.testPage.header.id}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem',
        alignItems: 'start',
      }}
    >
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Enpoint:</strong>
        <form
          onSubmit={handleSubmit}
          style={{ wordWrap: 'break-word', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}
        >
          <input
            data-testid={dataTestIds.testPage.header.endpoint}
            type="text"
            value={tempEndpoint}
            onChange={handleInputChange}
            style={{
              width: '90%',
              padding: '0.5rem',
              marginTop: '0.5rem',
              border: error ? '1px solid red' : '1px solid #ccc',
            }}
          />
          {showUpdateButton && (
            <button
              data-testid={dataTestIds.testPage.header.updateEndpoint}
              type="submit"
              style={{ padding: '0.25rem 0.5rem' }}
            >
              Update
            </button>
          )}
        </form>
      </div>
      {error && (
        <div style={{ color: 'red', marginTop: '0.5rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Chain:</strong>
        <div>{getChainForEndpoint(endpoint)}</div>
      </div>
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Status:</strong>
        <div data-testid={dataTestIds.testPage.header.connectionStatus}>
          {connected ? 'Connected' : 'Not connected'}
        </div>
      </div>
      <div style={{ wordWrap: 'break-word' }}>
        <strong>Wallet:</strong>
        <div>
          {publicKey ? (
            <Account data-testid={dataTestIds.testPage.header.account} account={publicKey.toBase58()} />
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {connected ? (
          <div data-testid={dataTestIds.testPage.header.disconnect}>
            <WalletDisconnectButton />
          </div>
        ) : (
          <div data-testid={dataTestIds.testPage.header.connect}>
            <WalletMultiButton />
          </div>
        )}
      </div>
    </div>
  );
};
