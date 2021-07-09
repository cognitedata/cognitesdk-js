Authentication in browsers
==========================

To utilize authentication in browsers using the SDK you need to use the `client.loginWithOAuth(...)` from `CogniteClient` instance of the SDK.

`loginWithOAuth(...)` will automatically handle authentication of the user and respond when the client get a `401`-response (not logged in) response from the API.

# Table of Contents
- [Authentication in browsers](#authentication-in-browsers)
- [Table of Contents](#table-of-contents)
  - [Why not using api keys?](#why-not-using-api-keys)
  - [Access tokens](#access-tokens)
  - [Authentication flow](#authentication-flow)
  - [How to authenticate with the SDK?](#how-to-authenticate-with-the-sdk)
    - [CDF auth flow](#cdf-auth-flow)
      - [Authentication with redirects](#authentication-with-redirects)
        - [Simple example](#simple-example)
        - [Customize redirect URL](#customize-redirect-url)
      - [Authentication with pop-up](#authentication-with-pop-up)
        - [Simple example](#simple-example-1)
        - [Customize redirect URL](#customize-redirect-url-1)
      - [Advance](#advance)
        - [Manually trigger authentication](#manually-trigger-authentication)
        - [Cache access tokens](#cache-access-tokens)
        - [Skip authentication](#skip-authentication)
        - [Combine different authentication methods](#combine-different-authentication-methods)
        - [Tokens](#tokens)
      - [More](#more)
    - [Azure AD auth flow](#azure-ad-auth-flow)
      - [Requirenments](#requirements)
      - [Authentication via redirect](#authentication-via-redirect)
        - [Redirect sign in type example](#redirect-sign-in-type-example)
      - [Authentication via pop-up](#authentication-via-pop-up)
        - [Pop-up sign in type example](#pop-up-sign-in-type-example)
      - [Get cdf token](#get-cdf-token)

## Why not using api keys?

It is **strongly recommended** to not use api keys in web applications since the api key is easily readable by everyone that have access to the application. Another restriction is that all users of your app share the same api-key. This means that all users have the same access level, you lose tracing/auditing per user, keys are not time limited etc.

## Access tokens

The solution to avoid using api keys is to use access tokens. This is short living tokens which grants the user access to CDF. The application get an access token by asking the user to sign in to the identity provider (Google, Active Directory etc) of a CDF project.

## Authentication flow

This describes the flow for the user using your application:
1. The user is using your app on this url: `https://my-app.com/some/path?someQuery=someValue`
2. The SDK redirect the user to the project's identity provider
3. After a successful log in the browser will redirect the user back to the url `https://my-app.com/some/path?someQuery=someValue&access_token=someToken&id_token=someToken`
4. The app will initialize again and `createClientWithOAuth` will be called again
5. The SDK now sees the query parameters `access_token` and `id_token` in the URL. It will parse them and remove them from the URL
6. The SDK is now authenticated (using the access token from the URL)

The access token will expire after some time and result in the user get `401` from CDF again. A new authentication process will be triggered by the SDK.

## How to authenticate with the SDK?

SDK supports the following authentication flows:
 - [CDF auth flow](#cdf-auth-flow)
 - [Azure AD auth flow](#azure-ad-auth-flow)

## CDF auth flow

There are two ways to authenticate using the CDF auth flow:

- [With redirect](#authentication-with-redirects)
- [With pop-up](#authentication-with-pop-up)

### Authentication with redirects

When doing authentication with redirects the browser window will be redirected to the identity provider for the user to sign in.
After signing in, the browser window will be redirected back to your application.

> You can find a running example application using redirects [here](../samples/react/authentication/src/App.js).

#### Simple example

```js
import { CogniteClient, REDIRECT } from '@cognite/sdk';
const client = new CogniteClient({ ... });
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  // default is redirect
  // but can be explicitly specified:
  onAuthenticate: REDIRECT,
}});

// then use the SDK:
const assets = await client.assets.retrieve({ id: 23232789217132 });
```

The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`. This will trigger the SDK to perform a redirect of the browser window to authenticate.

The second time `client.assets` is called the SDK will be authenticated and the call will succeed.

#### Customize redirect URL

If you want a different redirect url back to your app after a successful / unsuccessful sign in you can implement this:

```js
import { CogniteClient, REDIRECT } from '@cognite/sdk';
const client = new CogniteClient({ ... });
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.redirect({
      redirectUrl: 'https://my-app.com/successful-login',
      errorRedirectUrl: 'https://my-app.com/unsuccessful-login', // We encourage you to use this property as well. If not specified it will default to redirectUrl
    });
  },
}});
```

### Authentication with pop-up

When doing authentication with pop-up the current browser window of your application will remain the same,
but a new pop-up window will ask the user to sign in into the identity provider.
After a successful sign in, the pop-up window will automatically close itself.

> You can find a running example application using pop-up [here](../samples/react/authentication-with-popup/src/App.js).

#### Simple example

```js
import { CogniteClient, POPUP, isLoginPopupWindow, loginPopupHandler } from '@cognite/sdk';

if (isLoginPopupWindow()) {
  loginPopupHandler();
  return;
}
const client = new CogniteClient({ ... });
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: POPUP,
}});

// then use the SDK:
const assets = await client.assets.retrieve({ id: 23232789217132 });
```

The first time this will run the user will get a `401`-response from CDF in the first call to `client.assets`.
This will trigger the SDK to perform authentication of the user using a pop-up window. A new pop-up window will show the sign in screen of the identity provider.
After a successful sign in the pop-up window will be redirected back to your app (the same URL as the main browser window) where `sdk.loginPopupHandler`
will be executed and handle the tokens in the URL and close the window. **Therefore it is important** that `sdk.loginPopupHandler` will run when the pop-up window gets redirected back to your app
(otherwise the authentication process will fail).

After a successful authentication process the SDK will automatically retry the `client.assets` request and will eventually resolve and return the correct result.

#### Customize redirect URL

If you want a different redirect url back to your application after a successful / unsuccessful sign in you can do this:

```js
import { CogniteClient, POPUP } from '@cognite/sdk';
const client = new CogniteClient({ ... });
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.popup({
      redirectUrl: 'https://my-app.com/popup-handler',
      errorRedirectUrl: 'https://my-app.com/unsuccessful-login', // We encourage you to use this property as well. If not specified it will default to redirectUrl
    });
  },
}});
```

This only affect the pop-up window.

### Advance

#### Manually trigger authentication

To avoid waiting for the first `401`-response to occur you can trigger the authentication flow manually like this:
```js
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
}});
await client.authenticate(); // this will also return a boolean based on if the user successfully authenticated or not.
```

#### Cache access tokens

If you already have a access token you can use it to skip the authentication flow (see this [section](#tokens) on how to get hold of the token). If the token is invalid or timed out the SDK will trigger a standard auth-flow on the first 401-response from CDF.
```js
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  accessToken: 'ACCESS TOKEN FOR THE PROJECT HERE',
}});
```
> `client.authenticate()` will still override this and trigger a new authentication flow.

#### Skip authentication

It is possible to skip the authentication like this:
```js
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    login.skip();
  },
}});
```

#### Combine different authentication methods

If you want to use redirect method in the initialization of your app and use the pop-up method later (to not lose the state of your app)
you can implement something like this:

```js
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  onAuthenticate: login => {
    // some check:
    if (itShouldRedirect) {
      login.redirect({ ... });
    } else {
      login.popup({ ... });
    }
  },
}});
```

#### Tokens

If you need access to the tokens (access token, id token) from the login flow you can add a callback like this:

```js
client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
  project: 'YOUR PROJECT NAME HERE',
  onTokens: ({accessToken, idToken}) => {
    // your logic here
  },
}});
```

### More

Read more about the authentication process:
https://doc.cognitedata.com/dev/guides/iam/external-application.html#tokens

## Azure AD auth flow

Azure AD auth flow can be used via the `loginWithOAuth` method of `CogniteClient`.

### Requirements

Here is a list of requirements, that must be in place to use Azure AD authentication flow:

 - The CDF project, you're trying to sign in to, must be configured to accept tokens issued by Azure AD (or to be related to the cluster, that accepts Azure AD tokens, `bluefield` for instance)
 - You should have the `clientId` of your Azure AD application. It is used to provide Azure AD auth flow for your application.

Azure `tenantId` is also something, that should be defined to authenticate to Azure application which supports
single tenant authentication only. In case of multi tenant application, you can skip `tenantId` parameter to use
microsoft `https://login.microsoftonline.com/common` endpoint instead `https://login.microsoftonline.com/:tenantId`.
You can find more information about single/multi tenant Azure AD application [here](https://docs.microsoft.com/en-us/azure/active-directory/develop/howto-convert-app-to-be-multi-tenant#update-your-code-to-send-requests-to-common)

### Sign in types

Azure AD authentication flow supports these sign in methods:

 - [With redirect](#authentication-via-redirect)
 - [With pop-up](#authentication-via-pop-up)

### Authentication via redirect

When doing authentication with redirects the browser window will be redirected to the identity provider for the user to sign in.
After signing in, the browser window will be redirected back to your application.

> You might find useful example application using redirect Azure AD auth flow [here](../samples/react/authentication-aad/src/App.js).
> Remember to provide the required environment variables in the `.env` file.

#### Redirect sign in type example

```js
import { CogniteClient } from '@cognite/sdk';
const client = new CogniteClient({ ... });

// tenantId parameter can be skipped in order to use,
// https://login.microsoftonline.com/common endpoint to authenticate user
client.loginWithOAuth({ type: 'AAD_OAUTH', options: {
  cluster: 'cdf-cluster-name',
  clientId: 'azure-application-client-id',
  tenantId: 'azure-tenant-id'
}});

// authenticate to the provided cluster
await client.authenticate();

// set project name to make requsts to
client.setProject('cdf-project-name');

// then use the SDK:
const assets = await client.assets.retrieve({ id: 23232789217132 });
```

With the call `await client.authenticate()` you'll be redirected to the IdP to sign in.
After you have signed in, you'll be redirected back and `await client.authenticate()` call
will return you `true` as a result of the successful login. It is important
to set project for the `CogniteClient` instance via `client.setProject('project-name')`

### Authentication via pop-up

You can also provide a pop-up window for the user to sign in to Azure.
When doing authentication with pop-up the current browser window of your application will remain the same,
but a new window will pop-up asking the user to sign in into the identity provider. After a successful sign in, the pop-up window will automatically close itself

#### Pop-up sign in type example

```js
import { CogniteClient, AZURE_AUTH_POPUP } from '@cognite/sdk';
const client = new CogniteClient({ ... });

// tenantId parameter can be skipped in order to use,
// https://login.microsoftonline.com/common endpoint to authenticate user
client.loginWithOAuth({ type: 'AAD_OAUTH', options: {
  cluster: 'cdf-cluster-name',
  clientId: 'azure-application-client-id',
  tenantId: 'azure-tenant-id',
  signInType: AZURE_AUTH_POPUP,
}});

// authenticate to the provided cluster
await client.authenticate();

// set project name to make requsts to
client.setProject('cdf-project-name');

// then use the SDK:
const assets = await client.assets.retrieve({ id: 23232789217132 });
```

After `client.authenticate()` call application waits for the message from the pop-up window about
successful or unsuccessful sign in inside it. In case of `client.authenticate()` returns `true`
you good to set CDF project name and make requests.

### Get cdf token

After the user has been authenticated, you can acquire the CDF token via `await client.getCDFToken()`.
This method works only for Azure AD authentication flow. You can also check which flow has been used with `loginWithOAuth`:

```js
import { CogniteClient, AZURE_AUTH_POPUP, AAD_OAUTH } from '@cognite/sdk';
const client = new CogniteClient({ ... });

client.loginWithOAuth({ type: 'AAD_OAUTH', options: {
  cluster: 'cdf-cluster-name',
  clientId: 'azure-application-client-id',
  signInType: AZURE_AUTH_POPUP,
}});

// authenticate to the provided cluster
await client.authenticate();

// set project name to make requsts to
client.setProject('cdf-project-name');

if (client.getOAuthFlowType() === AAD_OAUTH) {
  const cdfToken = await client.getCDFToken()
}
```