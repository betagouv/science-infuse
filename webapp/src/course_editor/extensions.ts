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
        ImageBlock,
        ImageSearch,
        FileHandler.configure({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            onDrop: (editor: Editor, files: File[], pos: number) => {
                files.forEach(async (file) => {
                    // const url = await apiClient.uploadImage(file)
                    const url = "http://localhost:8000/s3/prof/clzcrfnqs0004101wmflpvz88/0480ad60-aeaf-4abe-95bd-a9d3ca8ee36b.png"
                    setTimeout(() => {
                        editor.chain().setImageBlockAt({ pos, src: url }).focus().run()
                    }, 2000)
                })
            },
            onPaste: (editor: Editor, files: File[]) => {
                files.forEach(async (file) => {
                    // const url = await apiClient.uploadImage(file)
                    const url = "http://localhost:8000/s3/prof/clzcrfnqs0004101wmflpvz88/0480ad60-aeaf-4abe-95bd-a9d3ca8ee36b.png"
                    // return editor.chain().setImage({src: url}).focus().run()
                    editor.chain().setImageBlockAt({ pos: editor.state.selection.anchor, src: "" }).focus().run()
                    setTimeout(() => {
                        return editor.chain().setImageBlockAt({ pos: editor.state.selection.anchor, src: url }).focus().run()
                    }, 2000)
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