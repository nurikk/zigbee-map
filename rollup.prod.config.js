import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";

const outDir = 'output';
export default {
    input: 'src/index.ts',
    output: {
        dir: outDir,
        format: 'iife'
    },
    plugins: [
        typescript({
            lib: ["es2017", "dom"],
            target: "es5"
        }),
        terser()
    ]
};