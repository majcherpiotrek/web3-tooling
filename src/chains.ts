const TestChains = {
    Sepolia: 11155111,
    Goerli: 420,
    /** @deprecated
     * Ropsten and Rinkeby networks are deprecated and will no longer receive protocol upgrades.
     * Please consider migrating your applications to Sepolia or Goerli.
     *
     * For more details see: https://ethereum.org/en/developers/docs/networks/
     * */
    Ropsten: 3,
    Rinkeby: 4,
} as const;
export const TestChainIds = Object.values(TestChains);
export type TestChain = keyof typeof TestChains;
export type TestChainId = typeof TestChains[TestChain];

const MainChains = {
    Mainnet: 1,
    BSC: 56,
    Polygon: 137,
    Avax: 43114,
} as const;
export const MainChainIds = Object.values(MainChains);
export type MainChain = keyof typeof MainChains;
export type MainChainId = typeof MainChains[MainChain];

export const Chains = {
    main: MainChains,
    test: TestChains,
};

export type Chain = MainChain | TestChain;
export type ChainId = MainChainId | TestChainId;
