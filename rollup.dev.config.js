import typescript from '@rollup/plugin-typescript';

import serve from 'rollup-plugin-serve'

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
        serve(outDir)
    ]
};