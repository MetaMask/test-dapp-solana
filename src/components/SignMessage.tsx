import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { type FC, useCallback, useState } from 'react';
import { Button } from './Button';

export const SignMessage: FC = () => {
  const { publicKey, signMessage } = useWallet();
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Hello, Solana!');
  const [loading, setLoading] = useState(false);

  /**
   * Handle message change.
   */
  const handleMessageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  /**
   * Handle sign message button click.
   */
  const handleSigneMessage = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new WalletNotConnectedError();
    }

    setLoading(true);
    try {
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      setSignedMessage(Buffer.from(signature).toString('base64'));
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage, message]);

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="message">Message:</label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={handleMessageChange}
          style={{ width: '90%', padding: '0.5rem', marginTop: '0.5rem' }}
        />
      </div>
      <Button onClick={handleSigneMessage} disabled={!publicKey} loading={loading}>
        Sign Message
      </Button>

      {signedMessage && (
        <>
          <h3>Signed Message</h3>
          <textarea
            id="signed-message"
            style={{ width: '100%', height: '200px', resize: 'none' }}
            value={signedMessage}
            readOnly
            onChange={() => {}}
          />
        </>
      )}
    </>
  );
};
