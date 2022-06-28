interface MethodResponseValues {
    eth_requestAccounts: string[];
    eth_chainId: string;
    eth_sendTransaction: string;
    wallet_requestPermissions: void;
}

export type EthereumMethod = keyof MethodResponseValues;

export interface RequestArguments<Method extends EthereumMethod, Params = unknown[] | Record<string, unknown>> {
    method: Method;
    params?: Params;
}

type MethodResponse<Method extends EthereumMethod> = Promise<MethodResponseValues[Method]>;

interface EventHandlers {
    chainChanged: (chainId: string) => void;
    accountsChanged: (accounts: string[]) => void;
    disconnect: (code: number, reason: string) => void;
}

export type EthereumEvent = keyof EventHandlers;

type EventHandler<EventName extends EthereumEvent> = EventHandlers[EventName];

export interface EthereumProviderBase {
    chainId: string | number;
    connected: boolean;
}

export type EthereumProvider = EthereumProviderBase & {
    isConnected(): boolean;
    request<Method extends EthereumMethod, Params = unknown[] | Record<string, unknown>>(
        args: RequestArguments<Method, Params>,
    ): MethodResponse<Method>;
    on<EventName extends EthereumEvent>(event: EventName, handlerFn: EventHandler<EventName>): void;
    removeListener<EventName extends EthereumEvent>(event: EventName, hadnlerFn: EventHandler<EventName>): void;
};
