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
                    const skills = (editor.storage.simetadata.skills || []).map((b: Skill) => b.id);
                    const educationLevels = (editor.storage.simetadata.educationLevels || []).map((b: Skill) => b.id);
                    const courseTitle = editor?.state.doc.firstChild?.textContent || "-";
                    handleSave(editor, chapterId, courseTitle, editor.getJSON(), skills, educationLevels)
                        .then(({ message, severity }) => {
                            this.options.showSnackbar(message, severity);
                        })
                    return true;
                },
        };
    },

});
