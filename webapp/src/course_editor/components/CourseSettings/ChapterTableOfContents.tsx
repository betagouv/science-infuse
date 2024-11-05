import CourseBlockNode from '@/course_editor/extensions/CourseBlock';
import { Summary } from "@codegouvfr/react-dsfr/Summary";
import styled from '@emotion/styled';
import { Editor, JSONContent } from '@tiptap/react';
import { ChevronRight } from 'lucide-react';

export const RenderChapterTOC = (props: { content: JSONContent[], onTitleClicked?: (blockId: string) => void }) => {
    const { content } = props;
    let blocks: { title: string; id: string }[] = [];

    if (content) {
        content
            .filter(block => block.type == CourseBlockNode.name)
            .forEach((block) => {
                const title = block.attrs?.title;
                const id = block.attrs?.id;
                blocks.push({ title, id });
            });
    }

    return (
        <ul className='list-none p-0 m-0'>
            {blocks.map((block) => <li key={block.id}>
                <p
                    className="m-0 flex-grow text-lg text-left text-[#161616] font-medium"
                    style={{
                        cursor: props.onTitleClicked ? "pointer" : "default"
                    }}
                    onClick={() => props.onTitleClicked && props.onTitleClicked(block.id)}
                >
                    {block.title}
                </p>
            </li>
            )}
        </ul>
    );
}

export const RenderChapterBlockTOC = (props: { content: JSONContent[] }) => {
    const { content } = props;
    let blocks: { title: string; level: number }[] = [];

    if (content) {
        content
            .filter(block => block.type == 'heading')
            .forEach((block) => {
                const title = block.content?.[0]?.text ?? '';
                const level = block.attrs?.level || 1;
                blocks.push({ title, level });
            });
    }


    return (
        <div className="flex flex-col gap-3">
            <ul className="list-none p-0">
                {blocks
                    .filter(b => b.level <= 3)
                    .map((block, index) => (
                        <li
                            key={`${block.title}-${index}`}
                            className='flex items-center max-w-full'
                            style={{
                                marginLeft: `${(block.level - 1) * 20}px`,
                                marginTop: block.level === 1 ? '12px' : '4px'
                            }}
                        >
                            <ChevronRight size={16} color='#000091' />
                            <p className="m-0 block overflow-hidden overflow-ellipsis whitespace-nowrap text-left text-gray-500 font-light cursor-pointer">
                                {block.title}
                            </p>
                        </li>
                    ))}
            </ul>
        </div>
    );
}

const StyledSummary = styled(Summary)`
ol > li > a:before {
    content: "•";
    padding-right: 8px;
}
`

const ChapterTableOfContents = (props: { editor: Editor, content: JSONContent[] }) => {
    let blocks: { title: string; id: string }[] = [];
    const { content } = props;
    if (content) {
        content
            .filter(block => block.type == CourseBlockNode.name)
            .forEach((block) => {
                const title = block.attrs?.title;
                const id = block.attrs?.id;
                blocks.push({ title, id });
            });
    }

    return (<StyledSummary
        className='bg-white p-0'
        links={blocks.map(b => ({
            linkProps: {
                href: `#${b.id}`
            },
            text: b.title
        }))}
        title=""
    />)
}

//     return <div className="flex flex-col gap-6">
//         <RenderChapterTOC
//             content={props.content}
//             onTitleClicked={(blockId: string) => {
//                 const domElement = document.querySelector(`[data-id="${blockId}"]`) as HTMLElement;
//                 domElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//             }}
//         />

//         {props.editor.isEditable && <div className="flex flex-col w-full">
//             <button
//                 onClick={() => addCourseBlockAtEnd(props.editor)}
//                 className="flex items-center gap-2 mb-2 p-0 w-fit "
//                 style={{ borderBottom: "2px solid black" }}>
//                 <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">    <path fillRule="evenodd" clipRule="evenodd" d="M7.33398 7.33334V3.33334H8.66732V7.33334H12.6673V8.66668H8.66732V12.6667H7.33398V8.66668H3.33398V7.33334H7.33398Z" fill="black" /></svg>
//                 <span className="text-base font-medium">
//                     Ajouter une nouvelle partie
//                 </span>
//             </button>
//         </div>}
//     </div>
// }

export default ChapterTableOfContents;