import React from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import { apiClient } from '@/lib/api-client';
import { PluginKey, Selection, TextSelection } from '@tiptap/pm/state'
import { Editor } from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model';
import { keymap } from '@tiptap/pm/keymap'


declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    CourseBlockNode: {
      addCourseBlock: (blockId: string) => ReturnType;
      removeCourseBlock: (id: string) => ReturnType;
    };
  }
  interface Node {
    attrs: {
      id?: string;
    };
  }

}


const CourseBlockNode = Node.create({
  name: 'courseBlock',
  group: 'block',
  content: 'title block+',

  addAttributes() {
    return {
      id: {
        default: () => `course-block-${Math.random().toString(36).substr(2, 9)}`,
      },
    }
  },
  onTransaction({transaction}) {
    transaction.steps.forEach((step) => {
      step.getMap().forEach((oldStart: number, oldEnd: number, newStart: number, newEnd: number) => {
        this.editor.state.doc.nodesBetween(newStart, newEnd, (node, pos: number) => {
          if (node.type.name === 'courseBlock') {
            console.log(`CourseBlock ${node.attrs.id} was updated`, node.toJSON())
          }
        })
      })
    })
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="chapter-course-block"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chapter-course-block', class: "chapter-course-block" }), 0]
  },

  addCommands() {
    return {
      addCourseBlock: (blockId: string) => ({ chain, state, editor }) => {

        if (state.selection.$from.depth > 1) {
          return false
        }

        return chain()
          .insertContent({
            type: this.name,
            attrs: { id: blockId },
            content: [
              {
                type: 'title',
                content: [{ type: 'text', text: 'Chapitre ...' }],
              },
              {
                type: 'paragraph',
              },
            ],
          })
          .focus()
          .run()

      },
      removeCourseBlock: (id: string) => ({ tr, dispatch, editor }) => {
        const { doc } = tr
        let nodePos = -1
        let blockId = ""

        doc.descendants((node, pos) => {
          if (node.type.name === 'courseBlock' && node.attrs.id === id) {
            nodePos = pos
            blockId = node.attrs.id;
            return false
          }
        })

        if (nodePos > -1) {
          tr.delete(nodePos, nodePos + doc.nodeAt(nodePos)!.nodeSize)
          if (dispatch) {
            dispatch(tr)
          }
          const newBlock = apiClient.deleteBlock(blockId);

          return true
        }

        return false
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      keymap({
        'Mod-a': (state, dispatch) => {
          const { selection, doc } = state
          const { $from } = selection
          let $start = $from
          let $end = $from

          // Find the start and end of the current CourseBlock
          doc.nodesBetween($from.start(), $from.end(), (node, pos) => {
            if (node.type.name === 'courseBlock') {
              $start = doc.resolve(pos)
              $end = doc.resolve(pos + node.nodeSize)
              return false
            }
          })

          // If we found a CourseBlock, create a new selection
          if ($start.pos !== $end.pos) {
            if (dispatch) {
              const newSelection = TextSelection.create(state.doc, $start.pos + 2, $end.pos - 2)
              dispatch(state.tr.setSelection(newSelection))
            }
            return true
          }

          return false
        },
      }),
    ]
  },


  addNodeView() {
    return ReactNodeViewRenderer(CourseBlockComponent)
  },
})


const CourseBlockComponent = ({ node, selected, editor }: { node: Node; editor: Editor; selected: boolean; }) => {
  const handleDelete = () => {
    if (node.attrs.id)
      editor.commands.removeCourseBlock(node.attrs.id)
  }

  return (
    <NodeViewWrapper className="relative chapter-course-block sm:rounded-xl sm:border sm:shadow-lg p-8">
      <span className="delete-course-block absolute top-4 right-4 cursor-pointer" onClick={handleDelete}>❌</span>
      <NodeViewContent className="content" />
    </NodeViewWrapper>
  )
}

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

export default CourseBlockNode;