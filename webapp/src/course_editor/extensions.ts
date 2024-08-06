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
import Focus from '@tiptap/extension-focus'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document'
import SlashCommand from './extensions/SlashCommand/SlashCommand'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import { FileHandler } from '@tiptap-pro/extension-file-handler'
import ImageSearch from './extensions/ImageSearch'
import SIVideo from './extensions/VideoSearch'
import CourseBlockNode, { TitleNode } from './extensions/CourseBlock'
import SIMetadata from './extensions/SIMetadata'
import { Editor } from '@tiptap/core';
import { apiClient } from '@/lib/api-client'
import ImageBlock from './extensions/ImageBlock/ImageBlock'
import PdfBlock from './extensions/PdfBlock/PdfBlock'
import { useSnackbar } from '@/app/SnackBarProvider'
import { FontSize } from './extensions/FontSize'


const CustomDocument = Document.extend({
    content: 'heading block*',
})

const imagesMime = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const pdfMime = ['application/pdf']


const handleFile = (file: File, editor: Editor, pos?: number) => {
    if (imagesMime.includes(file.type)) {
        editor.chain().setImageFromFile(file).focus().run()
    } else if (pdfMime.includes(file.type)) {
        editor.chain().setPdfFromFile(file).focus().run()
    }
}

export const getExtensions = () => {
    const { showSnackbar } = useSnackbar();

    return [
        SIMetadata,
        GlobalDragHandle.configure({
            dragHandleWidth: 20,
            scrollTreshold: 100,
            dragHandleSelector: ".drag-handle"
        }),
        Focus.configure({
            className: 'has-focus',
            mode: 'all',
        }),
        SlashCommand,
        SIVideo,
        CourseBlockNode,
        TitleNode,
        CustomDocument,
        StarterKit.configure({
            document: false,
        }),
        Highlight.configure({ multicolor: true }),
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
        ImageBlock.configure({
            showSnackbar: showSnackbar,
        }),
        PdfBlock,
        ImageSearch,
        FileHandler.configure({
            allowedMimeTypes: [...pdfMime, ...imagesMime],
            onDrop: (editor: Editor, files: File[], pos: number) => {
                files.forEach(async (file) => {
                    handleFile(file, editor, pos)

                })
            },
            onPaste: (editor: Editor, files: File[]) => {
                files.forEach(async (file) => {
                    handleFile(file, editor)
                })
            },
        }),
        // VideoSearch,
        Underline,
        Link,
        FontFamily,
        Color,
        TextAlign,
        TextStyle,
        FontSize,
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