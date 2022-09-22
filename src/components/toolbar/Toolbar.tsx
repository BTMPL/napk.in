import React, { useContext } from 'react';
import { PersistorState } from '../../services/persist';
import { AppStateContext } from '../appState';
import { DownloadIcon } from './DownloadIcon';
import { EditIcon } from './EditIcon';
import { PasswordIcon } from './PasswordIcon';
import { SyncIcon } from './SyncIcon';

import style from './toolbar.module.css';

export const Toolbar = () => {
    const { editor, persistance, store } = useContext(AppStateContext);
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
                <span className={style.icon} onClick={store.download}><DownloadIcon /></span>
                <span onClick={() => {
                    const salt = window.prompt('What\'s your new salt?');
                    if (salt) {
                        store.setSalt(salt)
                    }
                }} className={style.icon}><PasswordIcon /></span>
                <span onClick={toggleEditor} className={style.icon}><EditIcon /></span>
                <span className={style.icon} title={persistance.persistor?.lastSync?.toTimeString()} onClick={persistance.store}><SyncIcon isActive={isSyncing}/></span>
            </div>
        </div>
    )
}