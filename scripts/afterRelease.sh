yarn typedoc --json docs.json
node scripts/postProcessDocs.js

packageVersion=$(node -e "const fs = require('fs');\
const packageFile = fs.readFileSync('./package.json');\
const packageJson = JSON.parse(packageFile.toString());\
console.log(packageJson.version)")
branchName="feat/updateSDKJsExamples$packageVersion"

hub clone git@github.com:cognitedata/service-contracts.git
cd service-contracts

hub checkout -b "$branchName"
cp ../jsSnippets.json ./versions/v1/js-sdk-examples.json
hub add ./versions/v1/js-sdk-examples.json
hub commit -m "feat: update js code samples for sdk version $packageVersion"
git push origin "$branchName"
hub pull-request --no-edit -a polomani,f1cognite -r martincognite

cd ../
rm -rf service-contracts
rm jsSnippets.json
rm docs.json
