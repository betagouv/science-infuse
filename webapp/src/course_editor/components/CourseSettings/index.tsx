import { Editor } from "@tiptap/react";
import ExportToPdf from "./ExportToPdf";
import CourseInformations from "./CourseInformations";
import ShareToScienceInfuse from "./ShareToScienceInfuse";

const CourseSettings = (props: { editor: Editor }) => {
    return <div className="sticky top-8 h-full w-full bg-white z-[1] flex flex-col gap-8">
        <CourseInformations editor={props.editor} />
        <div className="flex flex-col gap-4 sticky bottom-4 w-full items-center justify-center z-[2] bg-white mt-auto">
            <ExportToPdf editor={props.editor} />
            {props.editor.isEditable && <ShareToScienceInfuse editor={props.editor} />}
        </div>
    </div>
}

export default CourseSettings;