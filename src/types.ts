import Web3 from "web3";

export interface WalletCallbacks {
    onAccountChanged?: (account: string) => void;
    onChainChanged?: (chainId: number) => void;
    onAccountDisconnected?: (reason?: Error) => void;
}

export interface WalletConnectedContext {
    web3: Web3;
    account: string;
    chainId: number;
    disconnect?: () => Promise<void>;
}
