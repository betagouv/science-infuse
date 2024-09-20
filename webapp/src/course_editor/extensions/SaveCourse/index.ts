import { TSeverity } from '@/app/SnackBarProvider';
import { Extension } from '@tiptap/core';
import { Editor } from '@tiptap/core';
import axios from 'axios';
import { handleSave } from './saveToDb';
import { Skill } from '@prisma/client';


declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        saveCourse: {
            save: (editor: Editor) => ReturnType;
        };
    }
}

export const SaveCourse = Extension.create({
    name: 'saveCourse',
    addOptions() {
        return {
            ...this.parent?.(),
            showSnackbar: (message: string, severity: TSeverity) => { },
        };
    },
    // addKeyboardShortcuts() {
    //     return {
    //         'Mod-s': () => this.editor.commands.save(this.editor),
    //     };
    // },

    addCommands() {
        return {
            save: (editor: Editor) =>
                () => {
                    const chapterId = editor.storage.simetadata.chapterId;
                    const courseTitle = editor?.state.doc.firstChild?.textContent || "-";
                    handleSave(editor, chapterId, courseTitle, editor.getJSON())
                        .then((response) => {
                            if (response == false) return;
                            const { message, severity } = response;
                            this.options.showSnackbar(message, severity);
                        })
                    return true;
                },
        };
    },

});
