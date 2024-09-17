import { Editor, JSONContent } from '@tiptap/core';
import { TSeverity } from '@/app/SnackBarProvider';
import { apiClient } from '@/lib/api-client';
import { EducationLevel, KeyIdea, Skill } from '@prisma/client';

export const saveBlocks = async (editorContent: JSONContent) => {
    const blocks = editorContent.content?.filter(element => element.type === "courseBlock")
    console.log("BLOCKS", blocks, editorContent)
    if (blocks && blocks.length > 0) {
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i]
            if (block.attrs && block.attrs.id && block.content) {
                const blockId = block.attrs.id;
                const blockKeyIdeas = (block.attrs.keyIdeas || []).map((b: KeyIdea) => b.id);
                const blockTitle = block.attrs?.title || ""

                try {
                    const saved = await apiClient.updateBlock(blockId, blockTitle, block.content, blockKeyIdeas)
                    if (!saved) {
                        return false;
                    }
                } catch (error) {
                    return false;
                }
            }
        }
    }
    return true;
}

interface HandleSaveResponse {
    message: string,
    severity: TSeverity
}

export const handleSave = async (editor: Editor, chapterId: string, title: string, content: JSONContent, skills: Skill[], educationLevels: EducationLevel[]): Promise<HandleSaveResponse> => {

    let saveChapterOk;
    try {
        saveChapterOk = await apiClient.saveChapter(chapterId, title, content, skills, educationLevels);
    } catch (error) {
        saveChapterOk = false;
    }
    const saveBlockOk = await saveBlocks(editor.getJSON())

    if (!saveChapterOk) {
        return { message: "Erreur lors de la sauvegarde du chapitre", severity: "error" }
    }

    if (!saveBlockOk) {
        return { message: "Erreur lors de la sauvegarde d'un bloc.", severity: "error" }
    }

    return { message: "Chapitre sauvegardé avec succès.", severity: "success" }

};