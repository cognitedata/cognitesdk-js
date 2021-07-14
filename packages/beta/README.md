Cognite Javascript SDK beta
===========================
The package `@cognite/sdk-beta` provides convenient access to the beta version of the Cognite API.
Setup is very similar to [stable](https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/stable/README.md),
but use the following command to install:
```
yarn add @cognite/sdk@npm:@cognite/sdk-beta
```
or with npm
```
npm install @cognite/sdk@npm:@cognite/sdk-beta --save
```

This will install the package `@cognite/sdk-beta` as a dependency, but aliased as `@cognite/sdk`.
In `package.json`, it will look like this:
```
    "@cognite/sdk": "npm:@cognite/sdk-beta@^X.X.X"
```

This will download `@cognite/sdk-beta` and pretend it is `@cognite/sdk`.
With the beta package installed under an alias, you don't need to modify your code
to access beta features. Import the `CogniteClient` as you normally would:
```js
import { CogniteClient } from '@cognite/sdk';
```

## Documentation

See the reference doc of `CogniteClient` [here](https://cognitedata.github.io/cognite-sdk-js/beta/classes/_beta_src_cogniteclient_.cogniteclient.html).

The beta API is a superset of stable. See the [stable readme](https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/stable/README.md).
