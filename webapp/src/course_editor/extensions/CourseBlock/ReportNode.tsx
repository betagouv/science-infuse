import React, { } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import { Node as PMNode } from '@tiptap/pm/model'
import { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view'
import preventDeletion from './pm/preventDeletion'

export const ReportNode = Node.create({
    name: 'report',
    group: 'block',
    content: 'block+',

    parseHTML() {
        return [{ tag: 'div[data-type="report"]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, { 'data-type': 'report' }),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ReportComponent)
    },
    addProseMirrorPlugins() {
        const { editor } = this

        return [
            preventDeletion(editor, this.name, "Bilan de bloc"),
        ]
    }
})

const ReportComponent = ({ node }: { node: PMNode; editor: Editor; selected: boolean }) => {
    return (
        <NodeViewWrapper className="report-node relative before:content-[''] before:absolute before:-left-8 before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--border-action-high-error)]">
            <NodeViewContent />
        </NodeViewWrapper>
    )
}