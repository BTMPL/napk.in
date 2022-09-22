import React, { useContext } from "react";
import { Editor } from "./components/editor";
import { Toolbar } from "./components/toolbar";
import { AppStateContext } from "./components/appState";

import styles from "./app.module.css";

function App() {

  const { store: { store, update } } = useContext(AppStateContext)
  
  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Toolbar />
      </div>
      <div className={styles.editor}>
        <Editor value={store?.content ?? ''} onChange={value => {
          update('content', value)
        }} />
      </div>
    </div>
  );
}

export default App;
