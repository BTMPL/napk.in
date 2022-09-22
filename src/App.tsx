import React from "react";
import "./App.css";
import {
  decryptPayload,
  encryptPayload,
  generateSalt,
} from "./services/crypto";
import { persist, retreive } from "./services/persist";
import {
  generateNewStore,
  generateNewStoreId,
  getStoreIdFromUrl,
  Store,
} from "./services/store";

async function test() {
  const message = await encryptPayload(
    {
      content: "this is a test",
      version: "1",
    },
    "letmein"
  );

  const decrypted = await decryptPayload(message, "letmein");
}

test();

const storeData = async (
  storeToPersist: Store,
  storeId: string,
  salt: string
) => {
  const payload = await encryptPayload(storeToPersist, salt);
  persist(payload, storeId);
};

const retreiveData = async (storeId: string, salt: string) => {
  const store = await retreive(storeId);
  if (store) {
    try {
      const decrypted = decryptPayload(store, salt);
      return decrypted;
    } catch {
      throw new Error();
    }
  }
  throw new Error();
};

function App() {
  const [salt, setSalt] = React.useState("");
  const [storeId, setStoreId] = React.useState(() =>
    getStoreIdFromUrl(window.location.pathname)
  );

  const [store, setStore] = React.useState(generateNewStore());

  React.useEffect(() => {
    if (!storeId) {
      setStoreId(generateNewStoreId());
      setSalt(generateSalt());
      setStore(generateNewStore());
    } else {
      window.history.pushState(undefined, "", `/d/${storeId}#${salt}`);
    }
  }, [storeId, salt]);

  return <>null</>;
}

export default App;
