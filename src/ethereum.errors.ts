export enum EthereumProviderStatusCode {
    USER_REJECTED_REQUEST = 4001,
    UNAUTHORIZED = 4100,
    UNSUPPORTED_METHOD = 4200,
    DISCONNECTED = 4900,
    CHAIN_DISCONNECTED = 4901,
}

export abstract class AbstractEthereumProviderError<T extends EthereumProviderStatusCode> extends Error {
    protected constructor(public code: T, message: string) {
        super(message);
    }
}

export class RequestRejectedByUser extends AbstractEthereumProviderError<EthereumProviderStatusCode.USER_REJECTED_REQUEST> {
    public constructor(public requestMethod: string) {
        super(EthereumProviderStatusCode.USER_REJECTED_REQUEST, `The user rejected the request: ${requestMethod}`);
    }
}

export class Unauthorized extends AbstractEthereumProviderError<EthereumProviderStatusCode.UNAUTHORIZED> {
    public constructor() {
        super(
            EthereumProviderStatusCode.UNAUTHORIZED,
            "The requested method and/or account has not been authorized by the user",
        );
    }
}

export class UnsupportedMethod extends AbstractEthereumProviderError<EthereumProviderStatusCode.UNSUPPORTED_METHOD> {
    public constructor(public unsupportedMethod: string) {
        super(
            EthereumProviderStatusCode.UNSUPPORTED_METHOD,
            `The Provider does not support the requested method: ${unsupportedMethod}`,
        );
    }
}

export class Disconnected extends AbstractEthereumProviderError<EthereumProviderStatusCode.DISCONNECTED> {
    public constructor() {
        super(EthereumProviderStatusCode.DISCONNECTED, "The Provider is disconnected from all chains.");
    }
}

export class ChainDisconnected extends AbstractEthereumProviderError<EthereumProviderStatusCode.CHAIN_DISCONNECTED> {
    public constructor() {
        super(EthereumProviderStatusCode.CHAIN_DISCONNECTED, "The Provider is not connected to the requested chain.");
    }
}

export type EthereumProviderError =
    | RequestRejectedByUser
    | Unauthorized
    | UnsupportedMethod
    | Disconnected
    | ChainDisconnected;

export const EthereumProviderErrors = {
    RequestRejectedByUser: (requestMethod: string) => new RequestRejectedByUser(requestMethod),
    Unauthorized: new Unauthorized(),
    UnsupportedMethod: (unsupportedMethod: string) => new UnsupportedMethod(unsupportedMethod),
    Disconnected: new Disconnected(),
    ChainDisconnected: new ChainDisconnected(),
};
