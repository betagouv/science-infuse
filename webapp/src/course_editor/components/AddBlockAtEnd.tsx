import { apiClient } from "@/lib/api-client"
import { Editor } from "@tiptap/core"
import { useRef, useState } from "react"

const pendingBlockCreationEditors = new WeakSet<Editor>()

export const addCourseBlockAtEnd = async (editor: Editor) => {
    if (pendingBlockCreationEditors.has(editor)) {
        return
    }

    pendingBlockCreationEditors.add(editor)
    try {
        const newBlock = await apiClient.createBlock({
            title: ``,
            content: '[]',
            chapterId: editor.storage.simetadata.chapterId,
        })
        editor.chain().focus().addCourseBlock(newBlock.id).run()
    } finally {
        pendingBlockCreationEditors.delete(editor)
    }
}

const AddBlockAtEnd = (props: { editor: Editor }) => {
    const [isCreating, setIsCreating] = useState(false)
    const isCreatingRef = useRef(false)

    if (!props.editor.isEditable)
        return "";

    const handleAddCourseBlock = async () => {
        if (isCreatingRef.current) {
            return
        }

        isCreatingRef.current = true
        setIsCreating(true)
        try {
            await addCourseBlockAtEnd(props.editor)
        } finally {
            isCreatingRef.current = false
            setIsCreating(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleAddCourseBlock}
            disabled={isCreating}
            className="flex items-center h-12 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left disabled:cursor-wait disabled:opacity-60"
        >
            <div className="flex flex-col items-center relative mt-16">
                <div className="flex items-center gap-2">
                    <svg
                        width={16}
                        height={17}
                        viewBox="0 0 16 17"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.33301 7.37431V3.37431H8.66634V7.37431H12.6663V8.70765H8.66634V12.7076H7.33301V8.70765H3.33301V7.37431H7.33301Z"
                            fill="black"
                        />
                    </svg>
                    <p className="m-0 text-2xl font-bold text-black">
                        Ajouter une nouvelle partie
                    </p>
                </div>
                <svg
                    width={345}
                    height={2}
                    viewBox="0 0 345 2"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full"
                >
                    <line x1={345} y1="0.540985" y2="0.540985" stroke="black" />
                </svg>
            </div>
        </button>
    )
}
export default AddBlockAtEnd;
