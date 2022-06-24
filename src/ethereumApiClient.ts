import { EthereumProvider } from "./ethereum.types";
import { EthereumProviderError, EthereumProviderErrors } from "./errors";
import { CONNECTION_REJECTED_STATUS_CODE } from "./constants";
import { isEmpty } from "ramda";
import detectEthereumProvider from "@metamask/detect-provider";
import { Maybe, Result } from "true-myth";
import {
    isEthereumRequestError,
    parseAccountsResponse,
    parseAndValidateEthereumChainId,
    parseEthereumChainId,
} from "./utils";

export interface EthereumApi {
    eth: EthereumProvider;
    getWalletChainId(supportedChainIds?: number[]): Promise<number>;
    requestWalletAccount(): Promise<string>;
}

const handleEthereumRequestError = (err: EthereumRequestError): EthereumProviderError => {
    switch (err.code) {
        case CONNECTION_REJECTED_STATUS_CODE:
            return EthereumProviderErrors.WalletConnectionRejectedError;
        default:
            return EthereumProviderErrors.UnexpectedRequestError(err);
    }
};

export const requestWalletAccount = (eth: Ethereum) => async (): Promise<string> => {
    try {
        const walletAccounts = await eth.request({ method: "eth_requestAccounts" });
        return parseAccountsResponse(walletAccounts).match({
            Ok: (account) => Promise.resolve(account),
            Err: Promise.reject,
        });
    } catch (e) {
        return Promise.reject(
            isEthereumRequestError(e)
                ? handleEthereumRequestError(e)
                : EthereumProviderErrors.UnexpectedRequestError(e),
        );
    }
};

const getWalletChainId =
    (eth: Ethereum) =>
    async (supportedChainIds: number[] = []): Promise<number> => {
        const validateChainId = isEmpty(supportedChainIds)
            ? parseEthereumChainId
            : parseAndValidateEthereumChainId(supportedChainIds);

        try {
            const chainId: string = await eth.request({ method: "eth_chainId" });
            return validateChainId(chainId).match({
                Ok: (okChainId) => Promise.resolve(okChainId),
                Err: Promise.reject,
            });
        } catch (e) {
            console.error("Failed to get wallet chain id", e);
            return Promise.reject(EthereumProviderErrors.UnexpectedRequestError(e));
        }
    };

export const getEthereumProvider = async (): Promise<EthereumApi> => {
    const ethProvider: Ethereum | null = (await detectEthereumProvider()) as Ethereum | null;

    return Maybe.of(ethProvider)
        .toOkOrErr(EthereumProviderErrors.NoWalletDetectedError)
        .flatMap((eth) =>
            eth === window.ethereum
                ? Result.ok<Ethereum, EthereumProviderError>(eth)
                : Result.err<Ethereum, EthereumProviderError>(EthereumProviderErrors.MultipleWalletsError),
        )
        .map<EthereumApi>((eth) => ({
            eth,
            getWalletChainId: getWalletChainId(eth),
            requestWalletAccount: requestWalletAccount(eth),
        }))
        .match({
            Ok: (api) => Promise.resolve(api),
            Err: Promise.reject,
        });
};
