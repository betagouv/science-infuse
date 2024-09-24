import { Editor, getNodeAtPosition } from "@tiptap/core";

const ActionButtons = (props: { editor: Editor, pos?: number }) => {
    console.log("EDIOTR POSSS", props.pos)
    return (
        <div contentEditable={false} className="w-full flex justify-center items-center gap-4 pb-8 relative">
            <div
                onClick={(e) => {
                    props.editor.commands.openFileImportPopup(props?.pos || 0)
                }}
                className="cursor-pointer w-full flex items-center gap-3 p-3 rounded bg-white border-2 border-[#e8edff]">
                <div className="flex justify-center items-center px-2 py-2 rounded bg-[#ececfe]">
                    <img src="/images/actionButtons/addImage.svg" className="h-13 w-auto" alt="Importer" width={24} height={24} />
                </div>
                <p className="m-0 text-base text-[#161616]">
                    Importer un fichier
                </p>
            </div>
            <div
                onClick={(e) => {
                    props.editor.commands.openContentSearchPopup(props?.pos || 0)
                }}
                className="cursor-pointer w-full flex items-center gap-3 p-3 rounded bg-white border-2 border-[#e8edff]">
                <div className="flex justify-center items-center px-2 py-2 rounded bg-[#ececfe]">
                    <img src="/images/actionButtons/search.svg" className="h-13 w-auto" alt="Chercher" width={24} height={24} />
                </div>
                <p className="m-0 text-base text-[#161616]">
                    Chercher dans Science Infuse
                </p>
            </div>
            <div
                onClick={(e) => {
                    if (props.pos) {

                        const [node, _] = getNodeAtPosition(props.editor.state, 'courseBlock', props.pos)
                        console.log("EDITOR", props.editor, props.pos, node)
                        if (node) {
                            props.editor.commands.openQuizPopup(props?.pos || 0, node)
                        }
                    }
                }}
                className="cursor-pointer w-full flex items-center gap-3 p-3 rounded bg-white border-2 border-[#e8edff]">
                <div className="flex justify-center items-center px-2 py-2 rounded bg-[#ececfe]">
                    <img src="/images/actionButtons/aiGeneration.svg" className="h-13 w-auto" alt="Générer" width={24} height={24} />
                </div>
                <p className="m-0 text-base text-[#161616]">
                    Générer un quiz
                </p>
            </div>
        </div>
    )
}
export default ActionButtons;