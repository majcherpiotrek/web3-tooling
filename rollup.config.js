import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

export default {
    input: `src/index.ts`,
    plugins: [nodeResolve(), typescript()],
    output: [
        {
            file: pkg.module,
            format: "es",
            sourcemap: true,
        },
    ],
    external: [
        "@metamask/detect-provider",
        "true-myth",
        "web3",
        "big.js",
        "@walletconnect/qrcode-modal",
        "@walletconnect/web3-provider",
    ],
};
