import { Editor } from "@tiptap/react";
import ExportToPdf from "./ExportToPdf";
import CourseInformations from "./CourseInformations";
import ShareToScienceInfuse from "./ShareToScienceInfuse";
import DuplicateChapter from "./DuplicateChapter";
import { ChapterWithoutBlocks } from "@/types/api";

const CourseSettings = (props: { chapter?: ChapterWithoutBlocks, editor: Editor }) => {
    return <div className="sticky top-8 h-full bg-white z-[1] flex flex-col gap-8 w-[300px]">
        <CourseInformations editor={props.editor} />
        <div className="flex flex-col gap-4 sticky bottom-0 pb-4 w-full items-center justify-center z-[20] bg-white mt-auto">
            {props.chapter?.id && !props.editor.isEditable && <DuplicateChapter chapterId={props.chapter.id} editor={props.editor} />}
            <ExportToPdf editor={props.editor} />
            {props.editor.isEditable && props.chapter && <ShareToScienceInfuse chapter={props.chapter} />}
        </div>
    </div>
}

export default CourseSettings;