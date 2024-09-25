import CourseBlockNode from '@/course_editor/extensions/CourseBlock';
import { Editor } from '@tiptap/react';
import { addCourseBlockAtEnd } from '../AddBlockAtEnd';

const ChapterTableOfContents = (props: { editor: Editor }) => {
    const content = props.editor.getJSON().content;
    let blocks: { title: string; domElement: HTMLElement }[] = [];
    if (content) {
        content
            .filter(block => block.type == CourseBlockNode.name)
            .forEach((block, index) => {
                const title = block.attrs?.title;
                const domElement = document.querySelector(`[data-id="${block.attrs?.id}"]`) as HTMLElement;
                console.log("BLOCK POS", domElement)
                blocks.push({ title, domElement });
            });
    }

    const handleTitleClick = (index: number) => {
        blocks[index].domElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return <div className="flex flex-col gap-6">
        {blocks.map((block, index) => (
            <p
                key={index}
                className="m-0 flex-grow text-base text-left text-[#161616] font-medium cursor-pointer"
                onClick={() => handleTitleClick(index)}
            >
                {block.title}
            </p>
        ))}
        {props.editor.isEditable && <div className="flex flex-col w-full">
            <button
                onClick={() => addCourseBlockAtEnd(props.editor)}
                className="flex items-center gap-2 mb-2 p-0 w-fit "
                style={{ borderBottom: "2px solid black" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">    <path fillRule="evenodd" clipRule="evenodd" d="M7.33398 7.33334V3.33334H8.66732V7.33334H12.6673V8.66668H8.66732V12.6667H7.33398V8.66668H3.33398V7.33334H7.33398Z" fill="black" /></svg>
                <span className="text-base font-medium">
                    Ajouter une nouvelle partie
                </span>
            </button>
        </div>}
    </div>
}

export default ChapterTableOfContents;