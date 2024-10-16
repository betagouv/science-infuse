import { FileHandler } from '@tiptap-pro/extension-file-handler'
import { Editor } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import Focus from '@tiptap/extension-focus'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import ContentSearch from './extensions/ContentSearch'
import CourseBlockNode from './extensions/CourseBlock'
import FileImport from './extensions/FileImport'
import { FontSize } from './extensions/FontSize'
import ImageBlock from './extensions/ImageBlock/ImageBlock'
import PdfBlock from './extensions/PdfBlock/PdfBlock'
import SIMetadata from './extensions/SIMetadata'
import SlashCommand from './extensions/SlashCommand/SlashCommand'
import SIVideo from './extensions/VideoBlock'

import { TSeverity } from '@/types/snackbar'
import Comments from './extensions/Comments'
import { TitleNode } from './extensions/CourseBlock/TitleNode'
import Quiz from './extensions/Quiz'
import { SaveCourse } from './extensions/SaveCourse'


const CustomDocument = Document.extend({
    content: 'heading courseBlock*',
})

const imagesMime = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const pdfMime = ['application/pdf']
const videoMime = ['video/mp4']


const handleFile = (file: File, editor: Editor, pos?: number) => {
    console.log("filefilefilefile", file, file.type)
    if (imagesMime.includes(file.type)) {
        editor.chain().setImageFromFile(file).focus().run()
    } else if (pdfMime.includes(file.type)) {
        editor.chain().setPdfFromFile(file).focus().run()
    } else if (videoMime.includes(file.type)) {
        editor.chain().setVideoFromFile(file).focus().run()
    }
}

export const getExtensions = (showSnackbar: (message: string, severity: TSeverity) => void) => {

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
        // course
        CourseBlockNode,
        // CourseBlockKeyIdeaPickerNode,
        TitleNode,
        // ContentNode,
        // /course
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
        Comments,
        // TrailingNode,
        ImageBlock.configure({
            showSnackbar: showSnackbar,
        }),
        SaveCourse.configure({
            showSnackbar: showSnackbar,
        }),
        PdfBlock,
        Quiz,
        ContentSearch,
        FileImport,
        FileHandler.configure({
            allowedMimeTypes: [...pdfMime, ...imagesMime, ...videoMime],
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
        // AutocompleteExtension,
        CharacterCount.configure({
            limit: 10000,
        }),
        Placeholder.configure({
            // placeholder: 'My Custom Placeholder',

            placeholder: (props) => {
                const { node, pos, editor } = props;
                if (!editor.isEditable)
                    return ""
                if (node.type.name === 'heading') {
                    if (pos === 0) {
                        return 'Donner un titre au chapitre';
                    }
                    if (node.attrs.level == 1) return 'Titre';
                    if (node.attrs.level == 2) return 'Sous-titre 1';
                    if (node.attrs.level == 3) return 'Sous-titre 2';
                }
                if (node.type.name == 'paragraph')
                    return "Tapez « / » pour afficher les commandes…";
                return ""
            },
            showOnlyWhenEditable: true,
            showOnlyCurrent: true,
            includeChildren: true
        }),
    ]
}