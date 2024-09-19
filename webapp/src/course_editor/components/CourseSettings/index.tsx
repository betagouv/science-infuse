import { Editor } from "@tiptap/react";
import ExportToPdf from "./ExportToPdf";
import CourseInformations from "./CourseInformations";

const CourseSettings = (props: { editor: Editor }) => {
    return <div className="sticky top-8 w-full bg-white z-[1] flex flex-col space-y-4">
        <CourseInformations editor={props.editor} />
        <ExportToPdf editor={props.editor} />
    </div>
}

export default CourseSettings;