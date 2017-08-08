import babel from 'rollup-plugin-babel';
import graphql from 'rollup-plugin-graphql';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import nodeResolve from 'rollup-plugin-node-resolve';

import pkg from './package.json';

export default [
  {
    entry: 'src/index.js',
    external: [
      'fs',
      'path',
      'util',
      'events',
      'assert',
      'crypto',
    ],
    plugins: [
      graphql(), // So Rollup can process .gql/.graphql files
      nodeResolve({
        main: true,
        module: true,
        jsnext: true,
      }), // so Rollup can find any commonjs packages
      commonjs({
        include: 'node_modules/**',
      }), // so Rollup can convert commonjs to an ES module
      babel({
        exclude: 'node_modules/**', // only transpile our source code
      }),
      filesize(), // Display the bundled file sizes
    ],
    targets: [
      { dest: pkg.main, format: 'cjs' },
      { dest: pkg.module, format: 'es' },
    ],
  },
];
