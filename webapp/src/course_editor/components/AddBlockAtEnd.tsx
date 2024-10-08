import { apiClient } from "@/lib/api-client"
import { Editor } from "@tiptap/core"
import { Plugin, TextSelection } from "prosemirror-state";

export const addCourseBlockAtEnd = async (editor: Editor) => {
    const newBlock = await apiClient.createBlock({
        title: ``,
        content: '[]',
        chapterId: editor.storage.simetadata.chapterId,
    })
    editor.chain().focus().command(({ tr, dispatch }) => {
        if (dispatch) {
            const { doc } = tr
            const position = doc.content.size
            const courseBlock = editor.schema.nodes.courseBlock.create(
                { id: newBlock.id },
                editor.schema.nodes.paragraph.create()
            )
            tr.insert(position, courseBlock)
            
            // Set the selection to the end of the newly created paragraph
            const newPosition = tr.doc.resolve(position + courseBlock.nodeSize - 1)
            tr.setSelection(new TextSelection(newPosition))
        }
        return true
    }).run()
}

const AddBlockAtEnd = (props: { editor: Editor }) => {

    if (!props.editor.isEditable)
        return "";
    return (
        <div onClick={() => addCourseBlockAtEnd(props.editor)} className="flex items-center h-12 cursor-pointer">
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
        </div>
    )
}
export default AddBlockAtEnd;