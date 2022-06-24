import { Result } from "true-myth";
import { AppError } from "../../../errors";
import Web3 from "web3";
import { EthereumNetworkId, EthereumProviderBase } from "../../types";

export interface WalletCallbacks {
    onConnected: (web3: Web3, account: string, network: EthereumNetworkId, disconnect: () => void) => void;
    onConnectionRejected: (error: AppError) => void;
    onAccountChanged: (account: string) => void;
    onDisconnected: () => void;
    onNetworkChanged: (network: Result<EthereumNetworkId, AppError>) => void;
}

export type WalletConnector = () => void;

export type UseWalletConnector = (
    callbacks: WalletCallbacks,
    subscribeToEvents?: <T extends EthereumProviderBase>(
        ethProvider: T,
        onDisconnected: () => void,
        onAccountChanged: (acc: string) => void,
        onNetworkChanged: (res: Result<EthereumNetworkId, AppError>) => void,
        disconnectWallet: () => void,
    ) => void,
) => WalletConnector;
