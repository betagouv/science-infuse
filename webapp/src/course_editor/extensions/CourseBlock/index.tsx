import React, { memo, useCallback, useEffect, useRef } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import { apiClient } from '@/lib/api-client';
import { PluginKey, Selection, TextSelection } from '@tiptap/pm/state'
import { Editor } from '@tiptap/core'
import { NodeType } from '@tiptap/pm/model';
import { keymap } from '@tiptap/pm/keymap'
import { useState } from '@preact-signals/safe-react/react';
import { Node as PMNode } from '@tiptap/pm/model'
import SkillsPicker from './SkillsPicker';
import KeyIdeasPicker from './KeyIdeaPicker';
import { KeyIdea } from '@prisma/client';
import ActionButtons from './ActionButtons';
import { Question } from '../Quiz/QuizPopup';
import { TextareaAutosize } from '@mui/material';

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    CourseBlockNode: {
      addCourseBlock: (blockId: string) => ReturnType;
      setCourseBlockTitle: (id: string, title: string) => ReturnType;
      removeCourseBlock: (id: string) => ReturnType;
      updateCourseBlockQuestions: (id: string, questions: Question[]) => ReturnType;
      updateCourseBlockKeyIdeas: (id: string, keyIdeas: KeyIdea[]) => ReturnType;
    };
  }
  interface Node {
    attrs: {
      id?: string;
      title?: string;
      quizQuestions: Question[];
      keyIdeas: KeyIdea[];
    };
  }
}



const CourseBlockNode = Node.create({
  name: 'courseBlock',
  group: 'block',
  content: 'block+',

  defining: true,
  isolating: true,

  addAttributes() {
    return {
      id: {
        default: () => `course-block-${Math.random().toString(36).substr(2, 9)}`,
      },
      title: {
        default: "",
        parseHTML: element => element.getAttribute('data-title'),
        renderHTML: attributes => ({
          'data-title': attributes.title,
        }),
      },
      quizQuestions: {
        default: [],
        parseHTML: element => JSON.parse(element.getAttribute('data-quizQuestions') || '[]'),
        renderHTML: attributes => ({
          'data-quizQuestions': JSON.stringify(attributes.quizQuestions),
        }),
      },
      keyIdeas: {
        default: [],
        parseHTML: element => JSON.parse(element.getAttribute('data-keyIdeas') || '[]'),
        renderHTML: attributes => ({
          'data-keyIdeas': JSON.stringify(attributes.keyIdeas),
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="chapter-course-block"]',
      },
    ]
  },

  // renderHTML({ HTMLAttributes }) {
  //   return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chapter-course-block', class: "chapter-course-block" }), 0]
  // },
  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chapter-course-block', class: "chapter-course-block" }),
      ['h2', { class: 'course-block-title' }, node.attrs.title],
      ['div', { class: 'course-block-content' }, 0]
    ]
  },
  addCommands() {
    return {
      setCourseBlockTitle: (id: string, title: string) => ({ tr, dispatch, chain, state, editor }) => {
        const { doc } = tr
        let nodePos = -1

        doc.descendants((node, pos) => {
          if (node.type.name === 'courseBlock' && node.attrs.id == id) {
            nodePos = pos
            return false
          }
        })

        if (nodePos > -1) {
          tr.setNodeAttribute(nodePos, 'title', title)
          if (dispatch) {
            dispatch(tr)
          }
          return false
        }

        return false
      },
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
          // const newBlock = apiClient.deleteBlock(blockId);

          return true
        }

        return false
      },
      updateCourseBlockQuestions: (id: string, questions: Question[]) => ({ tr, dispatch }) => {
        const { doc } = tr
        let nodePos = -1

        doc.descendants((node, pos) => {
          if (node.type.name === 'courseBlock' && node.attrs.id === id) {
            nodePos = pos
            return false
          }
        })

        if (nodePos > -1) {
          tr.setNodeAttribute(nodePos, 'quizQuestions', questions)
          if (dispatch) {
            dispatch(tr)
          }
          return true
        }

        return false
      },
      updateCourseBlockKeyIdeas: (id: string, keyIdeas: KeyIdea[]) => ({ tr, dispatch }) => {
        const { doc } = tr
        let nodePos = -1

        doc.descendants((node, pos) => {
          if (node.type.name === 'courseBlock' && node.attrs.id === id) {
            nodePos = pos
            return false
          }
        })

        if (nodePos > -1) {
          tr.setNodeAttribute(nodePos, 'keyIdeas', keyIdeas)
          if (dispatch) {
            dispatch(tr)
          }
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


const CourseBlockComponent = ({ node, selected, editor }: { node: PMNode; editor: Editor; selected: boolean; }) => {
  const handleDelete = () => {
    if (node.attrs.id)
      editor.commands.removeCourseBlock(node.attrs.id)
  }

  // store editor position before clicking on a button
  // in order to insert content at the right position
  // since if we clicked on the button, tiptap would update carret position (close to the button)
  const [storedSelection, setStoredSelection] = useState<Selection | null>(null)
  const handleMouseEnter = () => {
    setStoredSelection(editor.state.selection)
  }
  const handleMouseLeave = () => {
    setStoredSelection(null)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLElement && !e.target.isContentEditable) {
      e.preventDefault()
      e.stopPropagation()
      if (storedSelection) {
        editor.commands.setTextSelection(storedSelection)
      }
    }
  }


  const parentRef = useRef<HTMLDivElement>(null);

  return (
    <NodeViewWrapper data-id={node.attrs.id} ref={parentRef} className="relative chapter-course-block"
      onClick={handleClick}
    >
      {editor.isEditable && <span className="delete-course-block absolute top-2 right-2 cursor-pointer" onClick={handleDelete}>❌</span>}


      {/* Bloc Title */}
      {editor.isEditable && (
        <TextareaAutosize
          placeholder="Titre du bloc"
          className="mt-8 text-[2.25rem] font-bold text-left text-black w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 resize-none overflow-hidden"
          value={node.attrs.title}
          onChange={(e) => {
            const newTitle = e.target.value;
            editor.commands.setCourseBlockTitle(node.attrs.id, newTitle);
          }}
          minRows={1}
          style={{ height: 'auto' }}
        />
      )}
      {!editor.isEditable && (
        <div className="mt-8 text-[2.25rem] font-bold text-left text-black w-full mb-8">
          {node.attrs.title}
        </div>
      )}

      <div className="flex flex-col bg-[#f6f6f6] sm:rounded-xl sm:border sm:shadow-lg p-8">
        {editor.isEditable && <div
          className='sticky top-0 py-4 bg-[#f6f6f6] z-[100]'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <ActionButtons courseBlockNode={node} pos={storedSelection?.$anchor.pos || editor.view.state.selection.$anchor.pos} editor={editor} />
        </div>}
        <NodeViewContent className="content" />
      </div>
      <hr className='mt-8' />
    </NodeViewWrapper>
  )
}

const MemoKeyIdeasPicker = memo(KeyIdeasPicker);
export default CourseBlockNode;