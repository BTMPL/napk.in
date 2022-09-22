import React, { useContext } from 'react';
import { AppStateContext } from '../appState';
import { SyncIcon } from './SyncIcon';

import style from './toolbar.module.css';

export const Toolbar = () => {
    const { editor } = useContext(AppStateContext);
    const toggleEditor = React.useCallback(() => {
        editor.setIsActive(!editor.isActive)   
    }, [editor]);

    return (
        <div className={style.toolbar}>
            <div />
            <div>
            <button onClick={toggleEditor}>{editor.isActive ? 1 : 0} - toggle</button>
            <SyncIcon />
            </div>
        </div>
    )
}