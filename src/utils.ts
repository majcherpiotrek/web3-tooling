import { Maybe, Result } from "true-myth";
import { ChainId, Chains, MainChainId, TestChainId } from "./chains.js";
import { Web3Error, Web3Errors } from "./web3.errors.js";

const HEX_REG_EXP = /0[xX][0-9a-fA-F]+/;

export const isHex = (value: string) => HEX_REG_EXP.test(value);

export const isTestChainId = (chainId: number): chainId is TestChainId =>
    Object.values(Chains.test).includes(chainId as TestChainId);
export const isMainChainId = (chainId: number): chainId is MainChainId =>
    Object.values(Chains.main).includes(chainId as MainChainId);
export const isChainId = (chainId: number): chainId is ChainId => isMainChainId(chainId) || isTestChainId(chainId);

export const parseEthereumChainId = (chainId: string | number): Result<number, Web3Error> => {
    const parsedId: number =
        typeof chainId === "string" ? (isHex(chainId) ? parseInt(chainId, 16) : parseInt(chainId)) : chainId;

    return isNaN(parsedId) ? Result.err(Web3Errors.IncorrectChainId(chainId)) : Result.ok(parsedId);
};

export const parseAccountsResponse = (accounts: string[]): Result<string, Web3Error> =>
    Maybe.first(accounts).toOkOrErr(Web3Errors.EmptyAccountsListError);

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};
