import { PROJECT_NAME } from '@/config';
import { Editor, getNodeAtPosition } from '@tiptap/core';
import { Node as PMNode } from '@tiptap/pm/model'
import React from 'react';

const ActionButtons = (props: { courseBlockNode: PMNode, editor: Editor, pos?: number }) => {
    return (<div className="w-full flex-wrap flex justify-center items-center gap-4 relative">
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
                Chercher dans {PROJECT_NAME}
            </p>
        </div>
        <div
            onClick={() => {
                if (props.pos) {
                    props.editor.commands.openQuizPopup(props.courseBlockNode);
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