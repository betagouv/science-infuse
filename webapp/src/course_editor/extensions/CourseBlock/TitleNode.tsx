import React, {  } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import { Node as PMNode } from '@tiptap/pm/model'

export const TitleNode = Node.create({
    name: 'title',
    content: 'inline*',
    parseHTML() {
      return [{ tag: 'h2' }]
    },
    renderHTML({ HTMLAttributes }) {
      return ['h2', mergeAttributes(HTMLAttributes), 0]
    },
  })
  