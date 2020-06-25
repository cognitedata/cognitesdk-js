const path = require('path');
const snippetsFolder = path.join(process.cwd(), './codeSnippets');
const jsonDoc = require(snippetsFolder + '/docs.json');
const _ = require('lodash');
const fs = require('fs');

function stripMarkdownCodeSnippet(rawCode) {
  return rawCode
    .replace('```js', '')
    .replace('```', '')
    .trim();
}

function findAllCodeSnippetsInJsDoc(jsDoc) {
  const codeSnippets = new Map(); // string => string[]
  _.cloneDeepWith(jsDoc, (value, _, object) => {
    const docRegEx = /https:\/\/(doc.cognitedata.com|docs.cognite.com)\/api\/v1\/#operation\/([a-zA-Z0-9]+)/g;
    let matches;
    while ((matches = docRegEx.exec(value))) {
      const operationId = matches[2];
      const rawCode = object.text;
      if (!codeSnippets.has(operationId)) {
        codeSnippets.set(operationId, []);
      }
      codeSnippets.get(operationId).push(stripMarkdownCodeSnippet(rawCode));
    }
  });
  // comments appears two times in jsdoc...
  for (let operationId of codeSnippets.keys()) {
    codeSnippets.set(operationId, _.uniq(codeSnippets.get(operationId)));
  }
  return codeSnippets;
}

function joinSnippets(snippets) {
  return snippets.join('\n\n');
}

function writeCodeSnippetFile(codeSnippets, filepath) {
  const output = {
    language: 'JavaScript',
    label: 'JavaScript SDK',
    operations: {},
  };

  codeSnippets.forEach((snippets, operationId) => {
    output.operations[operationId] = joinSnippets(snippets);
  });
  fs.writeFileSync(filepath, JSON.stringify(output, null, 2) + '\n');
}

const codeSnippets = findAllCodeSnippetsInJsDoc(jsDoc);
const operationsWithHeader = ['redirectUrl'];
writeCodeSnippetFile(codeSnippets, snippetsFolder + '/index.json');
console.log('JS code snippets saved to: jsSnippets.json');

// write typescript file for syntax testing
codeSnippets.forEach((snippets, operationId) => {
  if (operationsWithHeader.indexOf(operationId) !== -1) {
    return;
  }
  const codeToTest = `
    import { CogniteClient, SequenceValueType } from '@cognite/sdk';
    const client = new CogniteClient({ appId: '[APP NAME]' });
    client.loginWithApiKey({
      project: '[PROJECT]',
      apiKey: '[API_KEY]'
    });
    (async () => {
      ${joinSnippets(snippets)}
    })();
  `;
  fs.writeFileSync(`${snippetsFolder}/${operationId}.ts`, codeToTest);
});

const jssnippetspath = path.join(snippetsFolder, './index.json');
fs.writeFileSync(jssnippetspath, JSON.stringify(resultJson, null, 2) + '\n');
console.log(`JS code snippets saved to: ${jssnippetspath}`);

// write tsconfig file
const tsconfig = {};
tsconfig.include = ['*.ts'];
tsconfig.compilerOptions = {
  noUnusedLocals: false,
  outDir: "dist",
  declaration: false,
  sourceMap: false
};
tsconfig.extends = '../../../tsconfig.build.json';

const tsconfigpath = path.join(snippetsFolder, './tsconfig.json');
fs.writeFileSync(tsconfigpath, JSON.stringify(tsconfig, null, 2) + '\n');
console.log(`TS config for code snippets saved to: ${tsconfigpath}`);
