import React from "react";
import "./App.css";
import { Editor } from "./components/editor";
import { Toolbar } from "./components/toolbar";
import {
  generateSalt,
} from "./services/crypto";
import {
  generateNewStore,
  generateNewStoreId,
  getStoreIdFromUrl,
  Store,
} from "./services/store";

import styles from "./app.module.css";
import { Persist } from "./services/persist";

function App() {

  const [persistor] = React.useState(() => {
    const p = new Persist()
    p.onPersistorStateChange(v => console.log(v))
    return p;
  });

  const [salt, setSalt] = React.useState(window.location.hash.toString().substr(1));
  const [storeId, setStoreId] = React.useState(() =>
    getStoreIdFromUrl(window.location.pathname)
  );

  const [store, setStore] = React.useState(generateNewStore());

  const updateStore = (field: keyof Store, value: string) => {
    setStore({
      ...store,
      [field]: value
    })
  }

  React.useEffect(() => {
    if (!storeId) {
      setStoreId(generateNewStoreId());
      setSalt(generateSalt());
      setStore(generateNewStore());
    } 
    if (storeId && salt) {
      window.history.pushState(undefined, "", `/n/${storeId}`);
      window.location.hash = salt;
    }
  }, [storeId, salt, store]);

  React.useEffect(() => {
    if (salt) {
      window.location.hash = salt;
    }
  }, [salt])

  React.useEffect(() => {
    if (store && storeId && salt) {
      return persistor.sync(store, storeId, salt);
    }
  }, [store, storeId, salt, persistor])

  React.useEffect(() => {
    if (storeId && salt) {
      (async () => {
        if (storeId && salt) {
          const remoteStore = await persistor.retreiveData(storeId, salt);
          if (remoteStore) {
            console.log(remoteStore)
            setStore(remoteStore)
          }
        }
      })();
    }
  }, [storeId, salt, persistor])


  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar />
      </div>
      <div className={styles.editor}>
        <Editor value={store.content} onChange={value => updateStore('content', value)} />
      </div>
    </div>
  );
}

export default App;
