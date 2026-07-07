import { Editor, Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import FileHandler from '@tiptap/extension-file-handler'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import Focus from '@tiptap/extension-focus'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { offset } from '@floating-ui/dom'
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
import H5P from './extensions/H5P'
import H5PBlock from './extensions/H5P/H5PBlock'
import { SaveCourse } from './extensions/SaveCourse'
import DragHandle from '@tiptap/extension-drag-handle'


const CustomDocument = Document.extend({
    content: 'heading? courseBlock*',
})

const PreventNestedCourseBlock = Extension.create({
    name: 'preventNestedCourseBlock',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                appendTransaction: (_transactions, _oldState, newState) => {
                    let tr = newState.tr
                    let hasChanges = false
                    const rootCourseBlockPositions = new Set<number>()

                    newState.doc.forEach((node, offset) => {
                        if (node.type.name === 'courseBlock') {
                            rootCourseBlockPositions.add(offset)
                            rootCourseBlockPositions.add(offset + 1)
                        }
                    })

                    newState.doc.descendants((node, pos) => {
                        if (node.type.name !== 'courseBlock') {
                            return
                        }

                        if (rootCourseBlockPositions.has(pos)) {
                            return
                        }

                        tr = tr.replaceWith(pos, pos + node.nodeSize, node.content)
                        hasChanges = true

                        return false
                    })

                    return hasChanges ? tr : null
                },
            }),
        ]
    },
})

const imagesMime = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
const pdfMime = ['application/pdf']
const videoMime = ['video/mp4']
const dragTargetClasses = ['drag-handle-target', 'drag-handle-target-course-block']
const dragHandleSelector = '[data-course-editor-drag-handle="true"]'
const dragAutoScrollEdgeSize = 112
const dragAutoScrollMaxSpeed = 28
let dragTargetElement: HTMLElement | null = null
let dragAutoScrollFrame: number | null = null
let dragAutoScrollPointerY: number | null = null
let dragAutoScrollElement: HTMLElement | null = null

const clearDragHandleTarget = () => {
    dragTargetElement?.classList.remove(...dragTargetClasses)
    dragTargetElement = null
}

const setDragHandleTarget = (editor: Editor, pos: number, nodeName?: string) => {
    if (dragTargetElement && !editor.view.dom.contains(dragTargetElement)) {
        clearDragHandleTarget()
    }

    if (pos < 0) {
        clearDragHandleTarget()
        return
    }

    const dom = editor.view.nodeDOM(pos)

    if (!(dom instanceof HTMLElement)) {
        clearDragHandleTarget()
        return
    }

    if (dom === dragTargetElement) {
        return
    }

    clearDragHandleTarget()
    dragTargetElement = dom
    dom.classList.add('drag-handle-target')

    if (nodeName === 'courseBlock') {
        dom.classList.add('drag-handle-target-course-block')
    }
}

const removeStaleDragHandles = (editor: Editor, activeElement: HTMLElement | null) => {
    const editorParent = editor.view.dom.parentElement

    if (!editorParent) {
        return
    }

    editorParent.querySelectorAll<HTMLElement>(dragHandleSelector).forEach(element => {
        if (element === activeElement) {
            return
        }

        const wrapper = element.parentElement

        if (wrapper && wrapper.parentElement === editorParent) {
            wrapper.remove()
            return
        }

        element.remove()
    })
}

const getScrollableElement = (target: EventTarget | null) => {
    let element = target instanceof HTMLElement ? target : null

    while (element && element !== document.body) {
        const style = window.getComputedStyle(element)
        const canScroll = /(auto|scroll)/.test(style.overflowY)
            && element.scrollHeight > element.clientHeight

        if (canScroll) {
            return element
        }

        element = element.parentElement
    }

    return document.scrollingElement as HTMLElement | null
}

const getAutoScrollDelta = (pointerY: number, top: number, bottom: number) => {
    if (pointerY < top + dragAutoScrollEdgeSize) {
        const distance = Math.max(0, pointerY - top)
        const intensity = 1 - distance / dragAutoScrollEdgeSize

        return -Math.max(4, Math.round(intensity * intensity * dragAutoScrollMaxSpeed))
    }

    if (pointerY > bottom - dragAutoScrollEdgeSize) {
        const distance = Math.max(0, bottom - pointerY)
        const intensity = 1 - distance / dragAutoScrollEdgeSize

        return Math.max(4, Math.round(intensity * intensity * dragAutoScrollMaxSpeed))
    }

    return 0
}

const runDragAutoScroll = () => {
    dragAutoScrollFrame = null

    if (dragAutoScrollPointerY === null || !dragAutoScrollElement) {
        return
    }

    const isDocumentScroller = dragAutoScrollElement === document.scrollingElement
    const top = isDocumentScroller ? 0 : dragAutoScrollElement.getBoundingClientRect().top
    const bottom = isDocumentScroller ? window.innerHeight : dragAutoScrollElement.getBoundingClientRect().bottom
    const delta = getAutoScrollDelta(dragAutoScrollPointerY, top, bottom)

    if (delta !== 0) {
        dragAutoScrollElement.scrollBy({ top: delta, behavior: 'auto' })
    }

    dragAutoScrollFrame = window.requestAnimationFrame(runDragAutoScroll)
}

const updateDragAutoScroll = (event: DragEvent) => {
    dragAutoScrollPointerY = event.clientY
    dragAutoScrollElement = getScrollableElement(event.target)

    if (dragAutoScrollFrame === null) {
        dragAutoScrollFrame = window.requestAnimationFrame(runDragAutoScroll)
    }
}

const stopDragAutoScroll = () => {
    document.removeEventListener('dragover', updateDragAutoScroll)
    document.removeEventListener('drop', stopDragAutoScroll)
    document.removeEventListener('dragend', stopDragAutoScroll)

    if (dragAutoScrollFrame !== null) {
        window.cancelAnimationFrame(dragAutoScrollFrame)
    }

    dragAutoScrollFrame = null
    dragAutoScrollPointerY = null
    dragAutoScrollElement = null
}


const handleFile = (file: File, editor: Editor, pos?: number) => {
    if (imagesMime.includes(file.type)) {
        editor.chain().setImageFromFile(file).focus().run()
    } else if (pdfMime.includes(file.type)) {
        editor.chain().setPdfFromFile(file).focus().run()
    } else if (videoMime.includes(file.type)) {
        editor.chain().setVideoFromFile(file).focus().run()
    }
}

export const getExtensions = (showSnackbar: (message: string, severity: TSeverity) => void) => {
    let dragHandleElement: HTMLElement | null = null

    return [
        SIMetadata,
        DragHandle.configure({
            nested: {
                defaultRules: true,
                edgeDetection: 'none',
                rules: [
                    {
                        id: 'excludeChapterTitle',
                        evaluate: ({ node, parent }) => {
                            return node.type.name === 'heading' && parent?.type.name === 'doc'
                                ? 1000
                                : 0
                        },
                    },
                ],
            },
            render() {
                const element = document.createElement('button')
                const icon = document.createElement('span')

                element.type = 'button'
                element.className = 'drag-handle'
                element.tabIndex = 0
                element.dataset.courseEditorDragHandle = 'true'
                element.setAttribute('aria-label', 'Déplacer')
                dragHandleElement = element
                icon.className = 'drag-handle__icon'
                icon.setAttribute('aria-hidden', 'true')
                element.appendChild(icon)

                return element
            },
            computePositionConfig: {
                placement: 'left-start',
                middleware: [
                    offset({
                        mainAxis: -8,
                        crossAxis: 4,
                    }),
                ],
            },
            onNodeChange(data) {
                const pos = 'pos' in data && typeof data.pos === 'number' ? data.pos : -1
                const nodeName = data.node?.type.name

                removeStaleDragHandles(data.editor, dragHandleElement)

                const isChapterTitle = nodeName === 'heading'
                    && pos > -1
                    && data.editor.state.doc.resolve(pos).depth === 0

                if (isChapterTitle) {
                    dragHandleElement?.style.setProperty('display', 'none')
                    clearDragHandleTarget()
                    return
                }

                dragHandleElement?.style.removeProperty('display')
                setDragHandleTarget(data.editor, pos, nodeName)
            },
            dragImageProperties: [
                'align-items',
                'background-color',
                'border',
                'border-color',
                'border-radius',
                'border-style',
                'border-width',
                'bottom',
                'box-sizing',
                'box-shadow',
                'color',
                'display',
                'flex',
                'flex-direction',
                'flex-shrink',
                'font-family',
                'font-size',
                'font-weight',
                'gap',
                'height',
                'justify-content',
                'left',
                'line-height',
                'max-height',
                'max-width',
                'min-height',
                'min-width',
                'object-fit',
                'object-position',
                'opacity',
                'overflow',
                'padding',
                'position',
                'right',
                'text-align',
                'top',
                'visibility',
                'white-space',
                'width',
                'z-index',
            ],
            onElementDragStart() {
                document.body.classList.add('course-editor-is-dragging')
                document.addEventListener('dragover', updateDragAutoScroll)
                document.addEventListener('drop', stopDragAutoScroll)
                document.addEventListener('dragend', stopDragAutoScroll)
            },
            onElementDragEnd() {
                document.body.classList.remove('course-editor-is-dragging')
                stopDragAutoScroll()
                clearDragHandleTarget()
            },
        }),
        Focus.configure({
            className: 'has-focus',
            mode: 'all',
        }),
        // Prevent pasted or externally inserted course blocks from nesting.
        // Any nested courseBlock wrapper is removed while preserving its inner content.
        PreventNestedCourseBlock,
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
            dropcursor: {
                class: 'course-editor-dropcursor',
                color: false,
                width: 2,
            },
            link: false,
            underline: false,
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
        H5P,
        H5PBlock,
        ContentSearch,
        FileImport,
        FileHandler.configure({
            allowedMimeTypes: [...pdfMime, ...imagesMime, ...videoMime],
            onDrop: (currentEditor, files, pos) => {
                files.forEach(async (file) => {
                    handleFile(file, currentEditor, pos)
                })
            },
            onPaste: (currentEditor, files: File[]) => {
                files.forEach(async (file) => {
                    handleFile(file, currentEditor)
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
            limit: 100000,
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
