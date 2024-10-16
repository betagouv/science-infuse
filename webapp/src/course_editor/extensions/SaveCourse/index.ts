import { TSeverity } from '@/types/snackbar';
import { Extension } from '@tiptap/core';
import { handleSave } from './saveToDb';


declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        saveCourse: {
            saveChapter: () => ReturnType;
        };
    }
}

export const SaveCourse = Extension.create({
    name: 'saveCourse',
    addOptions() {
        return {
            ...this.parent?.(),
        };
    },
    addCommands() {
        return {
            saveChapter: () =>
                () => {
                    const editor = this.editor;
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
