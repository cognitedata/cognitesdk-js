import { useState, useEffect } from 'react';
import { CogniteClient } from '@cognite/sdk';

const project = process.env.REACT_APP_PROJECT;
const cluster = process.env.REACT_APP_CLUSTER;
const clientId = process.env.REACT_APP_CLIENT_ID;
const authority = process.env.REACT_APP_AUTHORITY;

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

const client = new CogniteClient({appId: 'sample-app-id'});

function App() {
  const [assets, setAssets] = useState([]);
  const [isInit, setIsInit] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const fetchRootAssets = async () => {
    if (client === null) return;
    // fetch the first 10 (maximum) assets
    const assets = await client.assets
      .list()
      .autoPagingToArray({ limit: 10 });
    setAssets(assets);
  };

  const authenticate = async () => {
    if (client === null) return;

    const result = await client.authenticate();

    if (result) {
      client.setProject(project);
      setIsSignedIn(true);
    }
  }
  const onNoProjectAvailable = () => {
    console.log('Unfortunately, your token has no access to any project in the selected cluster');
  }

  useEffect(() => {
    const login = async (client) => {
      const result = await client.loginWithOAuth('ADFS_OAUTH', {
        authority,
        requestParams: {
          cluster,
          clientId,
        },
        onNoProjectAvailable
      });

      client.setProject(project);

      setIsInit(true);
      setIsSignedIn(result);
    }

    login(client);
  }, []);

  return (
    <div>
      <button disabled={!isInit || isSignedIn} onClick={authenticate}><h1>Authenticate</h1></button>
      <button disabled={!isInit || !isSignedIn} onClick={fetchRootAssets}><h1>Click here to fetch assets from Cognite</h1></button>
      {assets && renderAssetsInTable(assets)}
    </div>
  );
}

export default App;
