type Pathify<TSpec, TPrefix extends string = ''> = {
  [TKey in keyof TSpec]: TSpec[TKey] extends true
    ? `${TPrefix extends '' ? '' : `${TPrefix}.`}${Extract<TKey, string>}`
    : TSpec[TKey] extends object
      ? Pathify<
          TSpec[TKey],
          `${TPrefix extends '' ? '' : `${TPrefix}.`}${Extract<TKey, string>}`
        >
      : never;
};

function pathifyObject<TSpec>(value: TSpec): Pathify<TSpec> {
  function inner(
    input: Record<string, unknown>,
    path = '',
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(input)) {
      const fullPath = (path ? `${path}.${key}` : key).toLowerCase();
      if (entry === true) {
        result[key] = fullPath;
      } else if (typeof entry === 'object' && entry !== null) {
        result[key] = inner(entry as Record<string, unknown>, fullPath);
      } else {
        result[key] = entry;
      }
    }
    return result;
  }

  return inner(value as Record<string, unknown>) as Pathify<TSpec>;
}

/**
 * The list of test ids to access elements in the e2e2 tests.
 */
export const dataTestIds = pathifyObject({
  testPage: {
    header: {
      id: true,
      endpoint: true,
      updateEndpoint: true,
      connect: true,
      disconnect: true,
      account: true,
      connectionStatus: true,
      metamaskReady: true,
    },
    faucet: {
      id: true,
      getSol: true,
      convertSolToWsol: true,
    },
    signMessage: {
      id: true,
      message: true,
      signMessage: true,
      signedMessage: true,
    },
    sendSol: {
      id: true,
      address: true,
      signTransaction: true,
      sendTransaction: true,
      signedTransaction: true,
      transactionHash: true,
    },
    sendSolVersioned: {
      id: true,
      address: true,
      signTransaction: true,
      sendTransaction: true,
      signedTransaction: true,
      transactionHash: true,
    },
    sendMemo: {
      id: true,
      memo: true,
      signTransaction: true,
      sendTransaction: true,
      signedTransaction: true,
      transactionHash: true,
    },
    sendWSol: {
      id: true,
      nbAddresses: true,
      multipleTransactions: true,
      amount: true,
      signTransaction: true,
      sendTransaction: true,
      signedTransactions: true,
      transactionHashs: true,
    },
    partialSignTransaction: {
      id: true,
      signTransaction: true,
      signedTransaction: true,
    },
  },
} as const);

/**
 * The list of default addresses to use in the tests.
 */
export const defaultAddresses: string[] = [
  'JCp15hm4zQoghYFK277XE7xBBKVxmq4NBHU6TGV29Kqt',
  '9Yog6MiFfJFBt6rcf8Gt8s6TJ2smopTQJarsvpoLfQAN',
  '55EdfyK2ybuxmKXS54ciwND48xpDghrHChgXtkqNr9Wu',
  '2Jxpdvn2hK3bYDagpKoofGwRRrrnihYBp29AduDHbpnK',
  '7f79ENx115ax4qfMcAmqg6iE3PrCZxxNkHFD3LxVuWp9',
  '4p4zP8c23nJ9gcX9yVkfoL19YAmqjcyKxXsoVPokitgL',
  '3eNR755uyck3jrQnFxVty3Axy7sVykrVVdA3y8H68cvy',
  'FEZEJEhaSunrzNFfgc5yCbRCx7Ajet8UTX9NXK8mVthn',
  '3NmzWRuJ9s7SDdYe5ZVS8Dtv7naT9gT5t9tNxKJTnAHv',
  'EiGYPQ2F9pommkfrtxWCbxqi5QKx71gDRyv7Eb8LWB7a',
];
