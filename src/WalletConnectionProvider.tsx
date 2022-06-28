import * as React from "react";
import { WalletConnectedContext } from "./types.js";
import { WalletConnector } from "./WalletConnector.js";

interface WalletConnectionContext {
    wallet: WalletConnectedContext | null;
    connectBrowserWallet: () => void;
    isConnecting: boolean;
    error: Error | null;
}

const defaultConnectionContext: WalletConnectionContext = {
    wallet: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    connectBrowserWallet: () => {},
    isConnecting: false,
    error: null,
};

const WalletConnectionContext = React.createContext<WalletConnectionContext>(defaultConnectionContext);

interface Props {
    children?: React.ReactNode;
}
export const WalletConnectionProvider = ({ children }: Props) => {
    const [contextValue, setContextValue] = React.useState<Omit<WalletConnectionContext, "connectBrowserWallet">>({
        isConnecting: false,
        error: null,
        wallet: null,
    });

    const connectBrowserWallet = async () => {
        setContextValue((prevState) => ({ ...prevState, isConnecting: true, error: null }));
        try {
            const walletConnected = await WalletConnector.browser();
            setContextValue({
                wallet: walletConnected,
                isConnecting: false,
                error: null,
            });
        } catch (e) {
            setContextValue({ wallet: null, error: e as Error, isConnecting: false });
        }
    };

    return (
        <WalletConnectionContext.Provider value={{ ...contextValue, connectBrowserWallet }}>
            {children}
        </WalletConnectionContext.Provider>
    );
};

export const useConnectBrowserWallet = () => {
    const { connectBrowserWallet } = React.useContext(WalletConnectionContext);
    return React.useMemo(() => connectBrowserWallet, [connectBrowserWallet]);
};

export const useWalletConnectedContext = () => {
    const { wallet } = React.useContext(WalletConnectionContext);
    return React.useMemo(() => wallet, [wallet]);
};

export const useWalletConnectionState = () => {
    const { isConnecting, error } = React.useContext(WalletConnectionContext);

    return React.useMemo(() => ({ isConnecting, error }), [isConnecting, error]);
};
