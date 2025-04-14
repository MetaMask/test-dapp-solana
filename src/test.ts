
type Pathify<T, Prefix extends string = ''> = {
  [K in keyof T]: T[K] extends true
    ? `${Prefix extends '' ? '' : `${Prefix}.`}${Extract<K, string>}`
    : T[K] extends object
      ? Pathify<T[K], `${Prefix extends '' ? '' : `${Prefix}.`}${Extract<K, string>}`>
      : never;
};

function pathifyObject<T>(obj: T): Pathify<T> {
  function inner(obj: any, path: string = ''): any {
    const result: any = {};
    for (const key in obj) {
      const fullPath = path ? `${path}.${key}` : key;
      if (obj[key] === true) {
        result[key] = fullPath;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = inner(obj[key], fullPath);
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  }

  return inner(obj) as Pathify<T>;
}

/**
 * The list of test ids to access elements in the e2e2 tests.
 */
export const dataTestIds = pathifyObject({
  header: {
    id: true,
    endpoint: true,
    connect: true,
    disconnect: true,
    account: true,
    connectionStatus: true,
  },
  testPage: {
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
    }
  }

} as const)

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
