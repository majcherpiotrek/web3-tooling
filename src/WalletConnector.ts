import { EthereumMethod, EthereumProvider } from "./ethereum.types.js";
import detectEthereumProvider from "@metamask/detect-provider";
import { Maybe, Result } from "true-myth";
import { parseAccountsResponse, parseEthereumChainId } from "./utils.js";
import { Errors, handleEthereumProviderError, isEthereumProviderError } from "./errors.js";
import Web3 from "web3";
import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { IWalletConnectProviderOptions } from "@walletconnect/types";
import { Web3Errors } from "./web3.errors";

const handleRequestError = (requestMethod: EthereumMethod, err: unknown) =>
    isEthereumProviderError(err) ? handleEthereumProviderError(requestMethod, err) : Errors.UnknownError(err);

const requestWalletAccount = async (provider: EthereumProvider): Promise<Result<string, Error>> => {
    const method: EthereumMethod = "eth_requestAccounts";
    try {
        const walletAccounts = await provider.request({ method });
        return parseAccountsResponse(walletAccounts);
    } catch (e) {
        return Result.err(handleRequestError(method, e));
    }
};

const getWalletChainId = async (provider: EthereumProvider): Promise<Result<number, Error>> => {
    const method: EthereumMethod = "eth_chainId";
    try {
        const chainId: string = await provider.request({ method: "eth_chainId" });
        return parseEthereumChainId(chainId);
    } catch (e) {
        return Result.err(handleRequestError(method, e));
    }
};

interface WalletCallbacks {
    onAccountChanged?: (account: string) => void;
    onChainChanged?: (chainId: number) => void;
    onAccountDisconnected?: (reason?: Error) => void;
}

interface BrowserWalletConnectedResponse {
    ethProvider: EthereumProvider;
    web3: Web3;
    account: string;
    chainId: number;
}

interface MobileWalletConnectedResponse extends Omit<BrowserWalletConnectedResponse, "ethProvider"> {
    ethProvider: WalletConnectProvider;
    disconnect: () => Promise<void>;
}

const subscribeToWalletEvents = (callbacks: WalletCallbacks, provider: EthereumProvider) => {
    const onDisconnected = (err?: Error) => callbacks.onAccountDisconnected && callbacks.onAccountDisconnected(err);

    provider.on("accountsChanged", (accounts: string[]) =>
        parseAccountsResponse(accounts).match({
            Ok: (account) => callbacks.onAccountChanged && callbacks.onAccountChanged(account),
            Err: onDisconnected,
        }),
    );
    provider.on("chainChanged", (chainIdStr) =>
        parseEthereumChainId(chainIdStr).match({
            Ok: (chainId) => callbacks.onChainChanged && callbacks.onChainChanged(chainId),
            Err: onDisconnected,
        }),
    );

    provider.on("disconnect", (code: number, reason: string) => {
        onDisconnected(Web3Errors.MobileWalletDisconnected(code, reason));
    });
};

interface WalletConnectConfig extends IWalletConnectProviderOptions, WalletCallbacks {}

export const WalletConnector = {
    browser: async (config?: WalletCallbacks): Promise<BrowserWalletConnectedResponse> => {
        const ethProvider: EthereumProvider | null = (await detectEthereumProvider()) as EthereumProvider | null;

        const connectWallet = async (provider: EthereumProvider): Promise<BrowserWalletConnectedResponse> => {
            const accountResult = await requestWalletAccount(provider);
            const chainIdResult = await getWalletChainId(provider);
            return accountResult
                .flatMap((account) => chainIdResult.map((chainId) => ({ account, chainId })))
                .match({
                    Ok: ({ account, chainId }) => {
                        config && subscribeToWalletEvents(config, provider);
                        return Promise.resolve({
                            web3: new Web3(provider as any),
                            account,
                            chainId,
                            ethProvider: provider,
                        });
                    },
                    Err: (err) => Promise.reject(err),
                });
        };

        return Maybe.of(ethProvider)
            .toOkOrErr(Errors.NoWalletDetectedError)
            .flatMap<EthereumProvider>((provider) =>
                provider === window.ethereum ? Result.ok(provider) : Result.err(Errors.MultipleWalletsError),
            )
            .match({
                Ok: (provider) => connectWallet(provider),
                Err: (err) => Promise.reject(err),
            });
    },
    walletLink: async (config: WalletConnectConfig): Promise<MobileWalletConnectedResponse> => {
        const provider = new WalletConnectProvider({
            qrcodeModal: QRCodeModal,
            infuraId: config.infuraId,
            chainId: config.chainId,
            pollingInterval: config.pollingInterval,
            rpc: config.rpc,
        });
        const web3 = new Web3(provider as any);

        try {
            const walletLinkAccountsResponse = await provider.enable();
            const accountResult = parseAccountsResponse(walletLinkAccountsResponse);

            subscribeToWalletEvents(config, provider as unknown as EthereumProvider);

            return accountResult.match({
                Ok: (account) =>
                    Promise.resolve({
                        web3,
                        account,
                        chainId: provider.chainId,
                        disconnect: provider.disconnect.bind(provider),
                        ethProvider: provider,
                    }),
                Err: (err) => Promise.reject(err),
            });
        } catch (e) {
            console.log("WalletConnect connection failed", e);
            return Promise.reject(e);
        }
    },
};
