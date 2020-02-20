import typescript from '@rollup/plugin-typescript';

import serve from 'rollup-plugin-serve';
import { terser } from "rollup-plugin-terser";
const isWatch = !!process.env.ROLLUP_WATCH;

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
        isWatch ? serve(outDir) : null,
        isWatch ? null : terser()
    ]
};