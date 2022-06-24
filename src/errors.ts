import { EthereumNetworkId } from "./types";
import { AbstractAppError } from "../errors/abstractError";
import { getEthereumNetworkName } from "./utils";

export type EthereumProviderErrorType =
    | "NoWalletDetectedError"
    | "WalletDisconnectedError"
    | "MultipleWalletsError"
    | "IncompatibleNetworksError"
    | "UnsupportedNetworkError"
    | "WalletConnectionRejectedError"
    | "UnexpectedRequestError"
    | "EmptyAccountsListError"
    | "ResponseParsingError"
    | "InvalidAddress";

export class NoWalletDetectedError extends AbstractAppError<EthereumProviderErrorType> {
    constructor() {
        super("No wallet detected", "NoWalletDetectedError");
    }
}

export class WalletDisconnectedError extends AbstractAppError<EthereumProviderErrorType> {
    constructor() {
        super("Wallet not connected", "WalletDisconnectedError");
    }
}

export class MultipleWalletsError extends AbstractAppError<EthereumProviderErrorType> {
    constructor() {
        super(
            "An error occurred while initializing a connection to the wallet. There might be multiple wallets installed in the browser.",
            "MultipleWalletsError",
        );
    }
}

export class IncompatibleNetworksError extends AbstractAppError<EthereumProviderErrorType> {
    constructor(public networkId: EthereumNetworkId, expectedNetworkIds: EthereumNetworkId[]) {
        super(
            `${getEthereumNetworkName(networkId)} (id ${networkId}) detected. Expected: [${expectedNetworkIds
                .map(getEthereumNetworkName)
                .join(", ")}], (ids [${expectedNetworkIds.join(", ")}])`,
            "IncompatibleNetworksError",
        );
    }
}

export class UnsupportedNetworkError extends AbstractAppError<EthereumProviderErrorType> {
    constructor(public networkId: number | string) {
        super(
            `Unsupported Ethereum network: ID - ${networkId}. Supported IDs are: ${
                EthereumNetworkId.MainnetEth
            } (${getEthereumNetworkName(EthereumNetworkId.MainnetEth)}), ${
                EthereumNetworkId.LocalEth
            } (${getEthereumNetworkName(EthereumNetworkId.LocalEth)}), ${
                EthereumNetworkId.MainnetAvax
            } (${getEthereumNetworkName(EthereumNetworkId.MainnetAvax)}, ${
                EthereumNetworkId.LocalAvax
            } (${getEthereumNetworkName(EthereumNetworkId.LocalAvax)})`,
            "UnsupportedNetworkError",
        );
    }
}

export class UnexpectedRequestError extends AbstractAppError<EthereumProviderErrorType> {
    constructor(message: string) {
        super(message, "UnexpectedRequestError");
    }
}

export class WalletConnectionRejectedError extends AbstractAppError<EthereumProviderErrorType> {
    constructor() {
        super("Wallet connection has been rejected by the user", "WalletConnectionRejectedError");
    }
}

export class EmptyAccountsListError extends AbstractAppError<EthereumProviderErrorType> {
    constructor() {
        super("The wallet returned an empty accounts list", "EmptyAccountsListError");
    }
}

export class ResponseParsingError extends AbstractAppError<EthereumProviderErrorType> {
    constructor(message: string) {
        super(message, "ResponseParsingError");
    }
}

export class InvalidAddress extends AbstractAppError<EthereumProviderErrorType> {
    constructor(address: string) {
        super(`The address ${address} is invalid`, "InvalidAddress");
    }
}

export type EthereumProviderError =
    | NoWalletDetectedError
    | WalletDisconnectedError
    | MultipleWalletsError
    | IncompatibleNetworksError
    | UnsupportedNetworkError
    | WalletConnectionRejectedError
    | UnexpectedRequestError
    | EmptyAccountsListError
    | ResponseParsingError
    | InvalidAddress;

export const EthereumProviderErrors = {
    NoWalletDetectedError: new NoWalletDetectedError(),
    WalletDisconnectedError: new WalletDisconnectedError(),
    MultipleWalletsError: new MultipleWalletsError(),
    IncompatibleNetworksError: (detectedNetworkId: EthereumNetworkId, expectedNetworkIds: EthereumNetworkId[]) =>
        new IncompatibleNetworksError(detectedNetworkId, expectedNetworkIds),
    UnsupportedNetworkError: (networkId: number | string) => new UnsupportedNetworkError(networkId),
    UnexpectedRequestError: (err: Error) => new UnexpectedRequestError(err.message),
    WalletConnectionRejectedError: new WalletConnectionRejectedError(),
    EmptyAccountsListError: new EmptyAccountsListError(),
    ResponseParsingError: (message: string) => new ResponseParsingError(message),
    InvalidAddress: (address: string) => new InvalidAddress(address),
};
