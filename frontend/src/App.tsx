import React, { useContext } from "react";
import { Editor } from "./components/editor";
import { Toolbar } from "./components/toolbar";
import { AppStateContext } from "./components/appState";
import { AppState } from "./components/appState/AppStateContext";
import { Loading } from "./components/loading";

import styles from "./app.module.css";

function App() {
  const {
    store: { store, update },
    app: { state },
  } = useContext(AppStateContext);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar
          disabled={state === AppState.LOADING || state === AppState.SPLASH}
        />
      </div>
      <div className={styles.editor}>
        {state === AppState.LOADING && (
          <Loading>We're fetching your notes ...</Loading>
        )}
        {state === AppState.READY && (
          <Editor
            value={store?.content ?? ""}
            onChange={(value) => {
              update("content", value);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
