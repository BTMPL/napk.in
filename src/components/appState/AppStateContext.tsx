import React from 'react';

export const AppStateContext = React.createContext({
    editor: {
        isActive: false,
        setIsActive: (state: boolean) => {},
    },
})

type AppStatecontextProviderProps = {
    children: React.ReactNode,
}

export const AppStateProvider = ({ children }: AppStatecontextProviderProps) => {

    const [editor, setEditor] = React.useState({
        isActive: false
    })

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
            }
        }}>
            {children}
        </AppStateContext.Provider>
    )
}