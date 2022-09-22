import React from 'react';
import { generateSalt } from '../../services/crypto';
import { Persist } from '../../services/persist';
import { generateNewStore, generateNewStoreId, getStoreIdFromUrl, Store } from '../../services/store';

type ContextType = {
    editor: {
        isActive: boolean,
        setIsActive: (state: boolean) => void,
    },
    persistance: {
        persistor: Persist | null,
        store: () => void,
    },
    store: {
        store: Store | null,
        update: (field: keyof Store, value: string) => void,
        setSalt: (salt: string) => void,
    }
}

export const AppStateContext = React.createContext<ContextType>({
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
    }
})

type AppStatecontextProviderProps = {
    children: React.ReactNode,
}

export const AppStateProvider = ({ children }: AppStatecontextProviderProps) => {

    const [editor, setEditor] = React.useState({
        isActive: false
    })

    const [persistor] = React.useState(() => {
        const p = new Persist()
        return p;
    });    


    const [store, setStore] = React.useState(generateNewStore());
    const [salt, setSalt] = React.useState(window.location.hash.toString().substr(1));
    const [storeId, setStoreId] = React.useState(() =>
      getStoreIdFromUrl(window.location.pathname)
    );
  
  
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
        return persistor?.sync(store, storeId, salt);
      } else {
        persistor?.stop()
      }
    }, [store, storeId, salt, persistor])
  
    React.useEffect(() => {
      if (storeId && salt) {
        (async () => {
          if (storeId && salt) {
            try {
                const remoteStore = await persistor?.retreiveData(storeId, salt);
                if (remoteStore) {
                    setStore(remoteStore)
                } else {
                    throw new Error()
                }
            } catch {
                // TODO inform the UI that there was an error, do not try to override the store
                persistor.stop();
            }
          }
        })();
      }
    }, [storeId, salt, persistor])    

    const storeNow = () => {
        if (storeId && salt) {
            return persistor?.syncNow(store, storeId, salt);
        }
    }

    const updateStore = (field: keyof Store, value: string) => {
        setStore({
            ...store,
            [field]: value
        })
    }

    const changeSalt = (newSalt: string) => {
        if (!storeId) return;
        persistor.stop();
        (async() => {
            await persistor.storeData(store, storeId, newSalt);
            setSalt(newSalt);
        })()
    }

    return (
        <AppStateContext.Provider value={{
            editor: {
                ...editor,
                setIsActive: (state: boolean) => {
                    setEditor({
                        ...editor,
                        isActive: state
                    })
                }
            },
            persistance: {
                persistor,
                store: storeNow,
            },
            store: {
                store,
                update: updateStore,
                setSalt: changeSalt,
            }
        }}>
            {children}
        </AppStateContext.Provider>
    )
}