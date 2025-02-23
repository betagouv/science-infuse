import { apiClient } from '@/lib/api-client';
import { TSeverity } from '@/types/snackbar';
import { Editor, JSONContent } from '@tiptap/core';

// export const saveBlocks = async (chapterId: string, editorContent: JSONContent) => {
//     const blocks = editorContent.content?.filter(element => element.type === "courseBlock")
//     console.log("BLOCKS", blocks, editorContent)
//     if (blocks && blocks.length > 0) {
//         for (let i = 0; i < blocks.length; i++) {
//             const block = blocks[i]
//             if (block.attrs && block.attrs.id && block.content) {
//                 const blockId = block.attrs.id;
//                 // const blockKeyIdeas = (block.attrs.keyIdeas || []).map((b: KeyIdea) => b.id);
//                 const blockTitle = block.attrs?.title || ""
//                 console.log("BLOCK TITLE", blockTitle, block.content);

//                 try {
//                     const saved = await apiClient.updateBlock(chapterId, blockId, blockTitle, block.content)
//                     if (!saved) {
//                         return false;
//                     }
//                 } catch (error) {
//                     return false;
//                 }
//             }
//         }
//     }
//     return true;
// }

interface HandleSaveResponse {
    message: string,
    severity: TSeverity
}

export const handleSave = async (editor: Editor, chapterId: string, title: string, editorContent: JSONContent): Promise<HandleSaveResponse | false> => {
    if (!editor.isEditable) return false;
    let saveChapterOk;
    try {
        saveChapterOk = await apiClient.updateChapter(chapterId, {
            title,
            content: editorContent,
        });
    } catch (error) {
        saveChapterOk = false;
    }
    // const saveBlockOk = await saveBlocks(chapterId, editor.getJSON())

    if (!saveChapterOk) {
        return { message: "Erreur lors de la sauvegarde du chapitre", severity: "error" }
    }

    // if (!saveBlockOk) {
    //     return { message: "Erreur lors de la sauvegarde d'un bloc.", severity: "error" }
    // }

    return { message: "Chapitre sauvegardé.", severity: "success" }
};