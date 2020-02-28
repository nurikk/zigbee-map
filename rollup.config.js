import typescript from '@rollup/plugin-typescript';
import serve from 'rollup-plugin-serve'

import filesize from 'rollup-plugin-filesize';
import {
    terser
} from "rollup-plugin-terser";
const isWatch = !!process.env.ROLLUP_WATCH;

const outDir = 'output';

export default [{
        input: 'src/pages/map.ts',
        output: {
            dir: outDir,
            format: 'iife'
        },
        plugins: [
            typescript(),
            isWatch ? null : terser(),
            filesize()
        ]
    },
    {
        input: 'src/pages/zigbee.ts',
        output: {
            dir: outDir,
            format: 'iife'
        },
        plugins: [
            typescript(),
            isWatch ? null : terser(),
            filesize(),
            isWatch ? serve(outDir) : null
        ]
    }
];