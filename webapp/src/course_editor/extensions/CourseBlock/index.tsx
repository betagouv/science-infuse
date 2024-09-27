import Button from '@codegouvfr/react-dsfr/Button';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Checkbox, Collapse, TextareaAutosize } from '@mui/material';
import { useState } from '@preact-signals/safe-react/react';
import { KeyIdea } from '@prisma/client';
import { Editor, Node, mergeAttributes } from '@tiptap/core';
import { keymap } from '@tiptap/pm/keymap';
import { Node as PMNode } from '@tiptap/pm/model';
import { Selection, TextSelection } from '@tiptap/pm/state';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import React, { useRef } from 'react';
import { Question } from '../Quiz/QuizPopup';
import ActionButtons from './ActionButtons';
import { apiClient } from '@/lib/api-client';

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
  // renderHTML({ HTMLAttributes, node }) {
  //   return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chapter-course-block', class: "chapter-course-block" }),
  //     ['h2', { class: 'course-block-title' }, node.attrs.title],
  //     ['div', { class: 'course-block-content' }, 0]
  //   ]
  // },
  renderHTML({ HTMLAttributes, node }) {
    const quizQuestions: Question[] = node.attrs.quizQuestions || [];
    const quizContent = quizQuestions.length > 0 ? [
      ['div', { class: 'course-block-quiz' },
        ['h3', {}, 'Quiz'],
        ...quizQuestions.map((question, index) => [
          'div', { class: 'quiz-question' },
          ['p', {}, `Question ${index + 1}: ${question.question}`],
          ['ul', {},
            ...question.options.map(option => [
              'li', {},
              ['label', {},
                ['input', { type: 'checkbox', ...(option.correct==true?{checked: true}:{}), }],//disabled: true }],
                ` ${option.answer}`
              ]
            ])
          ]
        ])
      ]
    ] : [];
    console.log("QUIZQUESTIONS", quizQuestions, quizContent)

    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'chapter-course-block', class: 'chapter-course-block' }),
      ['h2', { class: 'course-block-title' }, node.attrs.title || ''],
      ['div', { class: 'course-block-content' }, 0],
      ...quizContent
    ];
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
          apiClient.deleteBlock(blockId);

          return true
        }

        return false
      },
      updateCourseBlockQuestions: (id: string, questions: Question[]) => ({ tr, dispatch, chain }) => {
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
          console.log("UPDATE BLOCK QUIZ", dispatch)
          if (dispatch) {
            dispatch(tr)
          }
          chain().run();
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

  const quizQuestions: Question[] = node.attrs?.quizQuestions || []


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
        <div className="mt-8 text-[2.25rem] leading-[2.5rem] font-bold text-left text-black w-full mb-8">
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

        {/* quiz if available */}
        {quizQuestions.length > 0 && <RenderBlockQuiz editor={editor} questions={quizQuestions} openQuizPopup={() => {
          editor.commands.openQuizPopup(node);
        }} />}

      </div>
      <hr className='mt-8' />
    </NodeViewWrapper>
  )
}


const RenderBlockQuiz = ({ editor, questions, openQuizPopup }: { editor: Editor, questions: Question[], openQuizPopup: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full">
      <button
        className="flex justify-between items-center w-full p-4 bg-white hover:!bg-white text-gray-800 hover:text-gray-800 rounded-lg shadow-sm transition-all duration-300 ease-in-out"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <p className="m-0 text-lg font-semibold text-gray-800">Quiz</p>
        <ExpandMoreIcon className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-gray-600`} />
      </button>

      <Collapse in={isExpanded}>
        <div className="my-4 p-4 bg-white rounded-b-lg shadow-md rounded-lg">
          {editor.isEditable && <div className="mb-4 text-center">
            <p className="text-gray-600 italic">Ceci est un aperçu du quiz. Pour apporter des modifications, cliquez sur le bouton ci-dessous.</p>
            <Button onClick={() => { setIsExpanded(false); openQuizPopup() }} className='bg-black'>Modifier le quiz</Button>
          </div>}

          <div className="cursor-not-allowed">
            <div className='pointer-events-none'>
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-6 p-6 bg-white rounded-lg shadow-md relative">
                  <p className="m-0 mb-4 text-lg font-semibold text-gray-800">Question {questionIndex + 1}</p>
                  <p className='m-0 py-4 text-xl text-gray-700'>{question.question}</p>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center w-full hover:bg-gray-50 transition-colors duration-200 rounded-md p-2">
                      <Checkbox
                        checked={option.correct}
                        className="mr-3"
                        sx={{ color: 'black', '&.Mui-checked': { color: 'black' } }}
                      />
                      <p className='m-0 text-gray-600'>{option.answer}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

export default CourseBlockNode;