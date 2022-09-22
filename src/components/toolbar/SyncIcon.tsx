import React from 'react';

import { ReactComponent as Icon } from './assets/sync.svg';

import style from './toolbar.module.css';

export const SyncIcon = ({ isActive = false }) => {
    return (
        <Icon style={{
            width: '24px',
            opacity: isActive ? 1 : 0.1,
        }} className={isActive ? style.spin : undefined} />
    )
}