import * as React from "react";
import { WalletCallbacks, WalletConnectedContext } from "./types.js";
import { WalletConnectConfig, WalletConnector } from "./WalletConnector.js";
import { Maybe } from "true-myth";
import { noop } from "./utils.js";

interface WalletConnectionContext {
    wallet: WalletConnectedContext | null;
    connectBrowserWallet: () => void;
    connectWithWalletConnect: (config: WalletConnectConfig) => void;
    isConnecting: boolean;
    error: Error | null;
}

const defaultConnectionContext: WalletConnectionContext = {
    wallet: null,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    connectBrowserWallet: noop,
    connectWithWalletConnect: noop,
    isConnecting: false,
    error: null,
};

const WalletConnectionContext = React.createContext<WalletConnectionContext>(defaultConnectionContext);

interface Props {
    children?: React.ReactNode;
}
export const WalletConnectionProvider = ({ children }: Props) => {
    const [contextValue, setContextValue] = React.useState<
        Omit<WalletConnectionContext, "connectBrowserWallet" | "connectWithWalletConnect">
    >({
        isConnecting: false,
        error: null,
        wallet: null,
    });

    const updateWalletConnectedContext =
        <T extends keyof WalletConnectedContext>(field: T) =>
        (value: WalletConnectedContext[T]) =>
            setContextValue((prevState) =>
                Maybe.of(prevState.wallet)
                    .map((wallet) => ({ ...wallet, [field]: value }))
                    .match({
                        Nothing: () => prevState,
                        Just: (updatedWallet) => ({ ...prevState, wallet: updatedWallet }),
                    }),
            );

    const walletCallbacks: WalletCallbacks = {
        onAccountChanged: updateWalletConnectedContext("account"),
        onChainChanged: updateWalletConnectedContext("chainId"),
        onAccountDisconnected: (reason) =>
            setContextValue({
                wallet: null,
                error: reason ?? null,
                isConnecting: false,
            }),
    };
    const connectWallet = (connectFn: () => Promise<WalletConnectedContext>) =>
        Maybe.of(contextValue.wallet).match({
            Nothing: async () => {
                setContextValue((prevState) => ({ ...prevState, isConnecting: true, error: null }));
                try {
                    const walletConnected = await connectFn();
                    setContextValue({
                        wallet: walletConnected,
                        isConnecting: false,
                        error: null,
                    });
                } catch (e) {
                    setContextValue({ wallet: null, error: e as Error, isConnecting: false });
                }
            },
            Just: () => Promise.resolve(),
        });

    const connectBrowserWallet = () => connectWallet(() => WalletConnector.browser(walletCallbacks));
    const connectWithWalletConnect = (config: WalletConnectConfig) =>
        connectWallet(() => WalletConnector.walletConnect({ ...config, ...walletCallbacks }));

    React.useEffect(
        () => () => {
            contextValue?.wallet?.disconnect?.();
        },
        [contextValue],
    );
    return (
        <WalletConnectionContext.Provider value={{ ...contextValue, connectBrowserWallet, connectWithWalletConnect }}>
            {children}
        </WalletConnectionContext.Provider>
    );
};

export const useConnectBrowserWallet = () => {
    const { connectBrowserWallet } = React.useContext(WalletConnectionContext);
    return React.useMemo(() => connectBrowserWallet, [connectBrowserWallet]);
};

export const useConnectWithWalletConnect = () => {
    const { connectWithWalletConnect } = React.useContext(WalletConnectionContext);
    return React.useMemo(() => connectWithWalletConnect, [connectWithWalletConnect]);
};

export const useWalletConnectedContext = () => {
    const { wallet } = React.useContext(WalletConnectionContext);
    return React.useMemo(() => wallet, [wallet]);
};

export const useWalletConnectionState = () => {
    const { isConnecting, error } = React.useContext(WalletConnectionContext);

    return React.useMemo(() => ({ isConnecting, error }), [isConnecting, error]);
};
