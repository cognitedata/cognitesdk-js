Cognite Javascript SDK playground
===========================
The package `@cognite/sdk-playground` provides a subset of api bindings to the Cognite [playground](https://docs.cognite.com/api/playground/). Note that the playground is
considered unstable and may periodically be out of date for certain resources. The playground sdk is not recommended for production and should only be used if you know what you are doing.
When a resource is removed from the playground it _may_ be found in the beta or stable packages, unless it was discontinued.

install instructions:
```
yarn add @cognite/sdk@npm:@cognite/sdk-playground
```
or with npm
```
npm install @cognite/sdk@npm:@cognite/sdk-playground --save
```

This will download `@cognite/sdk-playground`. Import the `CogniteClientPlayground` as you normally would:
```js
import { CogniteClientPlayground } from '@congite/sdk-playground';
```

## Documentation

 - [playground resources](https://docs.cognite.com/api/playground/).
