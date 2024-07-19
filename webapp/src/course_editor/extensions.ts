import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document'
import SlashCommand from './extensions/SlashCommand/SlashCommand'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import ImageSearch from './extensions/ImageSearch'
import SIVideo from './extensions/VideoSearch'
import ImageResize from 'tiptap-extension-resize-image';
import CourseBlockNode, { TitleNode } from './extensions/CourseBlock'
import SIMetadata from './extensions/SIMetadata'


const CustomDocument = Document.extend({
    content: 'heading block*',
  })
  
export const getExtensions = () => {
    return [
        SIMetadata,
        GlobalDragHandle.configure({
            dragHandleWidth: 20,
            scrollTreshold: 100,
            dragHandleSelector: ".drag-handle"
        }),
        SlashCommand,
        SIVideo,
        CourseBlockNode,
        TitleNode,
        CustomDocument,
        StarterKit.configure({
            document: false,
        }),
        Highlight,
        TaskList,
        TaskItem,
        Table.configure({
            resizable: true,
        }),
        TableRow,
        TableHeader,
        TableCell,
        // CodeBlock,
        // Image,
        ImageSearch,
        // VideoSearch,
        Underline,
        Link,
        FontFamily,
        Color,
        TextAlign,
        TextStyle,
        ImageResize,
        CharacterCount.configure({
            limit: 10000,
        }),
        Placeholder.configure({
            placeholder: (props) => {
                const { node, pos } = props;
                if (node.type.name === 'heading') {
                    if (pos === 0) {
                        return 'Titre du cours';
                    }
                    return 'Titre';
                }
                return "";
            },
            showOnlyWhenEditable: false,
            showOnlyCurrent: false,


        }),

    ]
}