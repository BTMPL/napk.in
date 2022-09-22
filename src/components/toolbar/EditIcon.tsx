import React from 'react';

import { ReactComponent as Icon } from './assets/edit.svg';

export const EditIcon = ({ isActive = false }) => {
    return (
        <Icon style={{
            width: '24px'
        }} />
    )
}