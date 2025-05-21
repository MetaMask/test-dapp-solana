type Pathify<T, Prefix extends string = ''> = {
    [K in keyof T]: T[K] extends true ? `${Prefix extends '' ? '' : `${Prefix}.`}${Extract<K, string>}` : T[K] extends object ? Pathify<T[K], `${Prefix extends '' ? '' : `${Prefix}.`}${Extract<K, string>}`> : never;
};
/**
 * The list of test ids to access elements in the e2e2 tests.
 */
export declare const dataTestIds: Pathify<{
    readonly testPage: {
        readonly header: {
            readonly id: true;
            readonly endpoint: true;
            readonly connect: true;
            readonly disconnect: true;
            readonly account: true;
            readonly connectionStatus: true;
        };
        readonly faucet: {
            readonly id: true;
            readonly getSol: true;
            readonly convertSolToWsol: true;
        };
        readonly signMessage: {
            readonly id: true;
            readonly message: true;
            readonly signMessage: true;
            readonly signedMessage: true;
        };
        readonly sendSol: {
            readonly id: true;
            readonly address: true;
            readonly signTransaction: true;
            readonly sendTransaction: true;
            readonly signedTransaction: true;
            readonly transactionHash: true;
        };
        readonly sendSolVersioned: {
            readonly id: true;
            readonly address: true;
            readonly signTransaction: true;
            readonly sendTransaction: true;
            readonly signedTransaction: true;
            readonly transactionHash: true;
        };
        readonly sendMemo: {
            readonly id: true;
            readonly memo: true;
            readonly signTransaction: true;
            readonly sendTransaction: true;
            readonly signedTransaction: true;
            readonly transactionHash: true;
        };
        readonly sendWSol: {
            readonly id: true;
            readonly nbAddresses: true;
            readonly multipleTransactions: true;
            readonly amount: true;
            readonly signTransaction: true;
            readonly sendTransaction: true;
            readonly signedTransactions: true;
            readonly transactionHashs: true;
        };
        readonly partialSignTransaction: {
            readonly id: true;
            readonly signTransaction: true;
            readonly signedTransaction: true;
        };
    };
}, "">;
/**
 * The list of default addresses to use in the tests.
 */
export declare const defaultAddresses: string[];
export {};
