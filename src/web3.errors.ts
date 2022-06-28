export type Web3ErrorType =
    | "NoWalletDetectedError"
    | "MultipleWalletsError"
    | "EmptyAccountsListError"
    | "ResponseParsingError"
    | "InvalidAddress"
    | "InvalidChainId"
    | "MobileWalletDisconnected"
    | "UnknownError";

export abstract class AbstractWeb3Error<ErrorType extends Web3ErrorType> extends Error {
    protected constructor(message: string, errorType: ErrorType) {
        super(message);
        this.errorType = errorType;
    }
    errorType: ErrorType;
}

export class NoWalletDetectedError extends AbstractWeb3Error<Web3ErrorType> {
    constructor() {
        super("No wallet detected", "NoWalletDetectedError");
    }
}

export class MultipleWalletsError extends AbstractWeb3Error<Web3ErrorType> {
    constructor() {
        super(
            "An error occurred while initializing a connection to the wallet. There might be multiple wallets available in the browser.",
            "MultipleWalletsError",
        );
    }
}

export class EmptyAccountsListError extends AbstractWeb3Error<Web3ErrorType> {
    constructor() {
        super("The wallet returned an empty accounts list", "EmptyAccountsListError");
    }
}

export class ResponseParsingError extends AbstractWeb3Error<Web3ErrorType> {
    constructor(message: string) {
        super(message, "ResponseParsingError");
    }
}

export class InvalidAddress extends AbstractWeb3Error<Web3ErrorType> {
    constructor(address: string) {
        super(`The address ${address} is invalid`, "InvalidAddress");
    }
}

export class IncorrectChainId extends AbstractWeb3Error<Web3ErrorType> {
    constructor(chainId: string | number) {
        super(`The chainId ${chainId} is invalid`, "InvalidChainId");
    }
}

export class MobileWalletDisconnected extends AbstractWeb3Error<Web3ErrorType> {
    constructor(code: number, reason: string) {
        super(`Mobile wallet disconnected - Code: ${code}, Reason: ${reason}`, "MobileWalletDisconnected");
    }
}
export class UnknownError extends AbstractWeb3Error<Web3ErrorType> {
    constructor(message: string) {
        super(message, "UnknownError");
    }
}

export type Web3Error =
    | NoWalletDetectedError
    | MultipleWalletsError
    | UnknownError
    | EmptyAccountsListError
    | ResponseParsingError
    | InvalidAddress
    | MobileWalletDisconnected
    | IncorrectChainId;

export const Web3Errors = {
    NoWalletDetectedError: new NoWalletDetectedError(),
    MultipleWalletsError: new MultipleWalletsError(),
    EmptyAccountsListError: new EmptyAccountsListError(),
    ResponseParsingError: (message: string) => new ResponseParsingError(message),
    InvalidAddress: (address: string) => new InvalidAddress(address),
    IncorrectChainId: (chainId: string | number) => new IncorrectChainId(chainId),
    MobileWalletDisconnected: (code: number, reason: string) => new MobileWalletDisconnected(code, reason),
    UnknownError: (err: any) => new UnknownError(err.message ? err.message : err),
};
