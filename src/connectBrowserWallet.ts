import { defaultWalletConfig, WalletCallbacks, WalletConfig } from "./types";
import Web3 from "web3";
import {
    parseAccountsResponse,
    parseEthereumChainId,
    getEthereumProvider,
} from "./utils";

export const useBrowserWallet = (
    { onNetworkChanged, onAccountChanged, onDisconnected }: WalletCallbacks,
    config: WalletConfig = defaultWalletConfig,
) => {
    const { supportedNetworks = [] } = config;

    const connectWallet = async () => {
        const ethApi = await getEthereumProvider();
        const web3 = new Web3(ethApi.eth as any);
        const account = await ethApi.requestWalletAccount();
        const chainId = await ethApi.getWalletChainId(supportedNetworks);

        ethApi.eth.on("accountsChanged", (accounts) => {
            console.log("accounts changed", accounts);
            parseAccountsResponse(accounts).match({
                Ok: onAccountChanged,
                Err: onDisconnected,
            });
        });

        ethApi.eth.on("chainChanged", (id) => {
            //todo
            const networkValidated = parseEthereumChainId(id);
            // if (networkValidated.isOk()) {
            //     connectWallet();
            // }
            onNetworkChanged(networkValidated);
        });

        return {
            web3,
            account,
            chainId,
            disconnect: onDisconnected,
        };
    };


    return connectWallet;
};
