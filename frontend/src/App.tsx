import React, { useContext } from "react";
import { Editor } from "./components/editor";
import { Toolbar } from "./components/toolbar";
import { AppStateContext } from "./components/appState";
import { AppState } from "./components/appState/AppStateContext";
import { Loading } from "./components/loading";
import { Error } from "./components/error";

import styles from "./app.module.css";

function App() {
  const {
    store: { store, update },
    app: { state },
  } = useContext(AppStateContext);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar disabled={state !== AppState.READY} />
      </div>
      <div className={styles.editor}>
        {state === AppState.DECRYPTION_FAILED && (
          <Error>
            We're unable to decrypt your note - double check that the URL you
            used is valid. If the URL is valid, and the decryption failed,
            please try again. If the error persist, your notes might be lost.
            Please understand we don't store your password and the notes are
            encrypted with a secure method.
          </Error>
        )}
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
