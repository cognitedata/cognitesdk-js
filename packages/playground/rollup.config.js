import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      sourcemap: true,
      externalLiveBindings: false,
    },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.build.json',
      typescript: require('typescript'),
      exclude: '**/__tests__/**',
    }),
    json({
      // All JSON files will be parsed by default,
      // but you can also specifically include/exclude files
      include: ['./package.json'],

      // for tree-shaking, properties will be declared as
      // variables, using either `var` or `const`
      preferConst: false, // Default: false

      // specify indentation for the generated default export —
      // defaults to '\t'
      indent: '  ',

      // ignores indent and generates the smallest code
      compact: true, // Default: false

      // generate a named export for every property of the JSON object
      namedExports: true, // Default: true
    }),
  ],
};
