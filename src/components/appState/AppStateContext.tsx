import React from 'react';
import { Persist } from '../../services/persist';

type ContextType = {
    editor: {
        isActive: boolean,
        setIsActive: (state: boolean) => void,
    },
    persistance: {
        persistor: Persist | null,
    }
}

export const AppStateContext = React.createContext<ContextType>({
    editor: {
        isActive: false,
        setIsActive: (state: boolean) => {},
    },
    persistance: {
        persistor: null,
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
            }
        }}>
            {children}
        </AppStateContext.Provider>
    )
}