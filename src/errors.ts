import {
    AbstractEthereumProviderError,
    EthereumProviderErrors,
    EthereumProviderStatusCode,
} from "./ethereum.errors.js";
import { Web3Errors } from "./web3.errors.js";

export const Errors = {
    Ethereum: EthereumProviderErrors,
    ...Web3Errors,
};

export const isError = (unknownError: any): unknownError is Error => "message" in unknownError;
export const isEthereumProviderError = (
    unknownError: any,
): unknownError is AbstractEthereumProviderError<EthereumProviderStatusCode> =>
    isError(unknownError) && "code" in unknownError;

export const handleEthereumProviderError = (
    requestMethod: string,
    err: AbstractEthereumProviderError<EthereumProviderStatusCode>,
) => {
    switch (err.code) {
        case EthereumProviderStatusCode.USER_REJECTED_REQUEST:
            return Errors.Ethereum.RequestRejectedByUser(requestMethod);
        case EthereumProviderStatusCode.UNAUTHORIZED:
            return Errors.Ethereum.Unauthorized;
        case EthereumProviderStatusCode.UNSUPPORTED_METHOD:
            return Errors.Ethereum.UnsupportedMethod(requestMethod);
        case EthereumProviderStatusCode.DISCONNECTED:
            return Errors.Ethereum.Disconnected;
        case EthereumProviderStatusCode.CHAIN_DISCONNECTED:
            return Errors.Ethereum.ChainDisconnected;
        default:
            return Errors.UnknownError(err);
    }
};
