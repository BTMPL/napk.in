import React from "react";
import { generateSalt } from "../../services/crypto";
import { downloadBlob } from "../../services/download";
import {
  Persist,
  PersistorDecodeError,
  PersistorRetreiveError,
  PersistS3,
} from "../../services/persist";
import {
  generateNewStore,
  generateNewStoreId,
  getStoreIdFromUrl,
  Store,
} from "../../services/store";

type ContextType = {
  app: {
    state: AppState;
  };
  editor: {
    isActive: boolean;
    setIsActive: (state: boolean) => void;
  };
  persistance: {
    persistor: Persist | null;
    store: () => void;
  };
  store: {
    store: Store | null;
    update: (field: keyof Store, value: string) => void;
    setSalt: (salt: string) => void;
    download: () => void;
  };
};

export enum AppState {
  SPLASH,
  LOADING,
  READY,
  DECRYPTION_FAILED,
}

export const AppStateContext = React.createContext<ContextType>({
  app: {
    state: AppState.SPLASH,
  },
  editor: {
    isActive: false,
    setIsActive: (state: boolean) => {},
  },
  persistance: {
    persistor: null,
    store: () => {},
  },
  store: {
    store: null,
    update: (field: keyof Store, value: string) => {},
    setSalt: (salt: string) => {},
    download: () => {},
  },
});

type AppStatecontextProviderProps = {
  children: React.ReactNode;
};

export const AppStateProvider = ({
  children,
}: AppStatecontextProviderProps) => {
  const [editor, setEditor] = React.useState({
    isActive: false,
  });

  const [persistor] = React.useState(() => {
    return new Persist(
      new PersistS3(
        "https://ns25oj2tt2.execute-api.eu-central-1.amazonaws.com/dev/upload",
        "https://napkin-encrypted-storage-dev.s3.eu-central-1.amazonaws.com"
      )
    );
  });

  const [state, setState] = React.useState<AppState>(() => {
    if (getStoreIdFromUrl(window.location.pathname)) {
      return AppState.LOADING;
    }
    return AppState.SPLASH;
  });
  const [store, setStore] = React.useState(generateNewStore());
  const [salt, setSalt] = React.useState(
    window.location.hash.toString().substr(1)
  );
  const [storeId, setStoreId] = React.useState(() =>
    getStoreIdFromUrl(window.location.pathname)
  );

  React.useEffect(() => {
    if (!storeId) {
      setStoreId(generateNewStoreId());
      setSalt(generateSalt());
      setState(AppState.READY);
    }
    if (storeId && salt) {
      window.history.pushState(undefined, "", `/n/${storeId}`);
      window.location.hash = salt;
    }
  }, [storeId, salt]);

  React.useEffect(() => {
    if (salt) {
      window.location.hash = salt;
    }
  }, [salt]);

  React.useEffect(() => {
    if (store && storeId && salt) {
      return persistor?.sync(store, storeId, salt);
    } else {
      persistor?.stop();
    }
  }, [store, storeId, salt, persistor]);

  React.useEffect(() => {
    if (storeId && salt) {
      (async () => {
        if (storeId && salt) {
          setState(AppState.LOADING);
          try {
            const remoteStore = await persistor?.retreiveData(storeId, salt);
            if (remoteStore) {
              setStore(remoteStore);
            }
            setState(AppState.READY);
          } catch (e) {
            setState(AppState.READY);
            if (e instanceof PersistorRetreiveError) {
              console.log(`Store ${storeId} not found`);
            } else if (e instanceof PersistorDecodeError) {
              console.log(`Unable to decrypt store ${storeId}`);
              setState(AppState.DECRYPTION_FAILED);
            }
            persistor.stop();
          }
        }
      })();
    }
  }, [storeId, salt, persistor]);

  const storeNow = () => {
    if (storeId && salt) {
      return persistor?.syncNow(store, storeId, salt);
    }
  };

  const updateStore = (field: keyof Store, value: string) => {
    setStore({
      ...store,
      [field]: value,
    });
  };

  const changeSalt = (newSalt: string) => {
    if (!storeId) return;
    persistor.stop();
    (async () => {
      await persistor.storeData(store, storeId, newSalt);
      setSalt(newSalt);
    })();
  };

  return (
    <AppStateContext.Provider
      value={{
        app: {
          state,
        },
        editor: {
          ...editor,
          setIsActive: (state: boolean) => {
            setEditor({
              ...editor,
              isActive: state,
            });
          },
        },
        persistance: {
          persistor,
          store: storeNow,
        },
        store: {
          store,
          update: updateStore,
          setSalt: changeSalt,
          download: () => {
            (async () => {
              downloadBlob(JSON.stringify(store), "napk.in.txt");
            })();
          },
        },
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
