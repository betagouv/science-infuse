import { Editor, getNodeAtPosition } from '@tiptap/core';
import React from 'react';

const ActionButtons = (props: { editor: Editor, pos?: number }) => {
    console.log("EDITOR POSSS", props.pos);
    return (<div className="w-full flex-wrap flex justify-center items-center gap-4 pb-8 relative">
        <div
            onClick={() => props.editor.commands.openFileImportPopup(props?.pos || 0)}
            className="max-w-[calc(100%/3)] cursor-pointer flex items-center gap-3 p-3 rounded bg-white border-2 border-[#e8edff]"
        >
            <div className="flex-shrink-0 flex justify-center items-center px-2 py-2 rounded bg-[#ececfe]">
                <img src="/images/actionButtons/addImage.svg" className="h-6 w-6" alt="Importer" />
            </div>
            <p className="m-0 text-ellipsis whitespace-nowrap text-base text-[#161616] overflow-hidden">
                Importer un fichier
            </p>
        </div>
        <div
            onClick={() => props.editor.commands.openContentSearchPopup(props?.pos || 0)}
            className="max-w-[calc(100%/3)] cursor-pointer flex items-center gap-3 p-3 rounded bg-white border-2 border-[#e8edff]"
        >
            <div className="flex-shrink-0 flex justify-center items-center px-2 py-2 rounded bg-[#ececfe]">
                <img src="/images/actionButtons/search.svg" className="h-6 w-6" alt="Chercher" />
            </div>
            <p className="m-0 text-ellipsis whitespace-nowrap text-base text-[#161616] overflow-hidden">
                Chercher dans Science Infuse
            </p>
        </div>
        <div
            onClick={() => {
                if (props.pos) {
                    const [node] = getNodeAtPosition(props.editor.state, 'courseBlock', props.pos);
                    console.log("EDITOR", props.editor, props.pos, node);
                    if (node) {
                        props.editor.commands.openQuizPopup(props?.pos || 0, node);
                    }
                }
            }}
            className="max-w-[calc(100%/3)] cursor-pointer flex items-center gap-3 p-3 rounded bg-white border-2 border-[#e8edff]"
        >
            <div className="flex-shrink-0 flex justify-center items-center px-2 py-2 rounded bg-[#ececfe]">
                <img src="/images/actionButtons/aiGeneration.svg" className="h-6 w-6" alt="Générer" />
            </div>
            <p className="m-0 text-ellipsis whitespace-nowrap text-base text-[#161616] overflow-hidden">
                Générer un quiz
            </p>
        </div>
    </div>
        );
};

export default ActionButtons;