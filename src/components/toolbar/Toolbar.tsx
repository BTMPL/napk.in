import React, { useContext } from 'react';
import { PersistorState } from '../../services/persist';
import { AppStateContext } from '../appState';
import { EditIcon } from './EditIcon';
import { SyncIcon } from './SyncIcon';

import style from './toolbar.module.css';

export const Toolbar = () => {
    const { editor, persistance } = useContext(AppStateContext);
    const [isSyncing, setIsSyncing] = React.useState(false)
    const handleStatusChange = React.useCallback((status: PersistorState) => {
        if (status === PersistorState.SAVING) {
            setIsSyncing(true);
        } else {
            setIsSyncing(false)
        }
    }, [])

    React.useEffect(() => {
        persistance.persistor?.onPersistorStateChange(handleStatusChange)
        return () => persistance.persistor?.onPersistorStateChangeRemove(handleStatusChange)
    }, [persistance.persistor, handleStatusChange])
    const toggleEditor = React.useCallback(() => {
        editor.setIsActive(!editor.isActive)   
    }, [editor]);

    return (
        <div className={style.toolbar}>
            <div />
            <div>
                <span onClick={toggleEditor} className={style.icon}><EditIcon /></span>
                <span title={persistance.persistor?.lastSync?.toTimeString()}><SyncIcon isActive={isSyncing}/></span>
            </div>
        </div>
    )
}