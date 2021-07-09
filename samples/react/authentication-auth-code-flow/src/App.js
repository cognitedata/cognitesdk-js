import { useState, useEffect, useMemo } from 'react';
import { CogniteClient } from '@cognite/sdk';


const AAD_CONFIG = {
  clientId: "a44c13ac-a854-4bb4-ac3a-c1e8e6eb8c25",
  openIdConfigurationUrl: 'https://login.microsoftonline.com/cd0dddb2-9ef0-41f7-bde4-b65fa44fa2c3/v2.0/.well-known/openid-configuration',
  responseMode: 'fragment',
  extraScope: 'openid profile offline_access https://asia-northeast1-1.cognitedata.com/user_impersonation https://asia-northeast1-1.cognitedata.com/IDENTITY',
  loginParams: {
    prompt: 'select_account'
  },
  cluster: 'asia-northeast1-1',
}

const aizeAudience = {
  audience: "https://twindata.io/aize-cognite1/T101014843",
};
const AIZE_CONFIG = {
  openIdConfigurationUrl: "https://test.login.aize.io/.well-known/openid-configuration",
  cluster: 'westeurope-1',
  clientId: "KthrD6rOXkrcGhsy4D1txOHzrYstaa77",
  responseMode: "query",
  extraScope: 'openid profile offline_access',
  authenticateParams: aizeAudience,
  refreshParams: aizeAudience,
  loginParams: {
    prompt: "login",
  },
};

function App() {
  const [token, setToken] = useState();
  const [inspect, setInspect] = useState();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(undefined);


  const client = useMemo(() => new CogniteClient({ appId: 'sample-app-id' }), []);

  useEffect(() => {
    client.loginWithOAuth('OIDC_AUTHORIZATION_CODE_FLOW', {
      flow: 'authorization-flow',

      ...AAD_CONFIG,

      onNoProjectAvailable: () => console.log('Unfortunately, your token has no access to any project in the selected cluster')
    }).then(signedIn => setIsSignedIn(signedIn))
      .catch(e => setError(e.message))
  }, [client]);

  const login = async () => {
    try {
      const loggedin = await client.authenticate();
      setIsSignedIn(loggedin);
    } catch (e) {
      console.log('login error', e);
    }
  }

  useEffect(async () => {
    if (isSignedIn) {
      const token = await client.getCDFToken();
      const inspect = await client.get('/api/v1/token/inspect');

      setToken(token);
      setInspect(inspect);
    }
  }, [client, isSignedIn]);


  return (
    <div>
      <button onClick={() => login()}><h1>Authenticate</h1></button>
      <h3>signed in</h3>
      { JSON.stringify(isSignedIn) }

    { error && (
        <>
        <h3>error</h3>
        <pre>{error}</pre>
        </>
    )}

        <h3>/api/v1/token/inspect</h3>
        <pre>
        {JSON.stringify(inspect, null, 2)}
        </pre>


        <h3>token</h3>
        <pre>
        {JSON.stringify(token, null, 2)}
        </pre>

    </div>
  );
}

export default App;
