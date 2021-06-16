import React, { useState, useEffect } from 'react';
import { CogniteClient, isLoginPopupWindow, loginPopupHandler, POPUP } from '@cognite/sdk';

const project = 'publicdata';
const client = new CogniteClient({ appId: 'Cognite SDK samples' });
const renderAssetsInTable = (assets) => {
  return (
    <table>
      <tbody>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
      {assets.map(asset => (
        <tr key={asset.id}>
          <td>{asset.name}</td>
          <td>{asset.description}</td>
        </tr>
      ))}
      </tbody>
    </table>
  );
}

const App = () => {
  const [assets, setAssets] = useState([]);
  const [isInit, setIsInit] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const fetchRootAssets = async () => {
    try {
      const assets = await client.assets
        .list()
        .autoPagingToArray({ limit: 10 });

      setAssets(assets);
    } catch (err) {
      console.error(err);
    }
  }
  const authenticate = async () => {
    const result = await client.authenticate();

    setIsSignedIn(result);
  }

  useEffect(() => {
    if (isLoginPopupWindow()) {
      loginPopupHandler();
      return;
    }

    // for popups you should design your application so the `login.popup`-call is based on a user interaction
    // to avoid the browser blocking the popup window. See https://stackoverflow.com/a/2587692/4462088
    // You can call `login.popup` whenever you want. The SDK will pause all requests until you have called it.
    // So it is possible to create a user-interface with a "Click here to login"-button that triggers `login.popup`.
    const init = async () => {
      const result = await client.loginWithOAuth({ type: 'CDF_OAUTH', options: {
        project,
        onAuthenticate: POPUP,
      }});

      setIsInit(true);
      setIsSignedIn(result);
    }

    init();
  }, []);
  return (
    <div className="App">
      <button disabled={!isInit || isSignedIn} onClick={authenticate}><h1>Authenticate</h1></button>
      <button disabled={!isInit || !isSignedIn} onClick={fetchRootAssets}><h1>Click here to fetch assets from Cognite</h1></button>
      {assets && renderAssetsInTable(assets)}
    </div>
  );
};

export default App;
