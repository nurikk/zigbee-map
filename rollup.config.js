import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve'
import multiInput from 'rollup-plugin-multi-input';
import filesize from 'rollup-plugin-filesize';


import {
    terser
} from "rollup-plugin-terser";
const isWatch = !!process.env.ROLLUP_WATCH;

const outDir = 'output';
export default [{
        input: 'src/pages/*.ts',
        output: {
            dir: outDir
        },
        plugins: [
            multiInput({
                relative: 'src/pages'
            }),
            typescript(),
            isWatch ? serve(outDir) : null,
            isWatch ? null : terser(),
            filesize()
        ]
    }
];