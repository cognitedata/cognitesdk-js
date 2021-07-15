module.exports = {
  name: 'Cognite JavaScript SDK (playground)',

  // Stable and core use 'file' mode, which makes reference pages based on the names of classes and types.
  // Derived SDKs usually re-definine classes using the same name, which breaks in file mode.
  // 'modules' mode makes the file path part of the url, which allows classes with overlapping
  // names across packages.
  mode: 'modules',
  module: 'umd',
  target: 'ES6',
  exclude: ['**/__tests__/**', '**/node_modules/**'],
  out: './docs/',
  readme: 'README.md',
  ignoreCompilerErrors: true,
  excludeNotExported: false,
  hideGenerator: true,
  excludePrivate: true,
  excludeProtected: true,
  includeDeclarations: true,
  excludeExternals: false,
};
