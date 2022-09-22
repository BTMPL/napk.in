import React from 'react';
import MDEditor from '@uiw/react-md-editor';
import { AppStateContext } from '../appState';

type EditorProps = {
    onChange: (str: string) => void,
    value: string,
}

export const Editor = ({ onChange, value }: EditorProps) => {

    const { editor: { isActive: isEditorActive }} = React.useContext(AppStateContext)
    

    if (!isEditorActive) {
        return <MDEditor.Markdown source={value} />
    }
    return (
        <>
            <MDEditor
                value={value}
                onChange={(v) => onChange(v ?? '')}
                preview={'edit'}
                visibleDragbar={false}
                height={'100%'}
            />
        </>
    )
}