import React, { } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import { Node as PMNode } from '@tiptap/pm/model'
import { EditorState, Transaction } from '@tiptap/pm/state'
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view'
import preventDeletion from './pm/preventDeletion'

export const IntroductionNode = Node.create({
    name: 'introduction',
    group: 'block',
    content: 'block+',

    parseHTML() {
        return [{ tag: 'div[data-type="introduction"]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, { 'data-type': 'introduction' }),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(IntroductionComponent)
    },
    addProseMirrorPlugins() {
        const { editor } = this

        return [
            preventDeletion(editor, this.name, "Introduction"),
        ]
    }
})

const IntroductionComponent = ({ node }: { node: PMNode; editor: Editor; selected: boolean }) => {
    return (
        <NodeViewWrapper className="introduction-node relative before:content-[''] before:absolute before:-left-8 before:top-0 before:bottom-0 before:w-[2px] before:bg-[var(--border-action-high-success)]">
            <NodeViewContent />
        </NodeViewWrapper>
    )
}