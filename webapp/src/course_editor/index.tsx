import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import CodeBlock from '@tiptap/extension-code-block'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import React, { useMemo } from 'react'
import SlashCommand from './extensions/SlashCommand/SlashCommand'
import { EditorContext } from './context/EditorContext'
import { TextMenu } from './extensions/BubbleMenu/BubbleMenu'
import styled from '@emotion/styled'
import GlobalDragHandle from 'tiptap-extension-global-drag-handle'
import ImageSearch from './extensions/ImageSearch'
import Image from '@tiptap/extension-image'
import SIVideo from './extensions/VideoSearch'
import VideoSearch from './extensions/VideoSearch'
import ImageResize from 'tiptap-extension-resize-image';

const StyledEditor = styled.div`

.drag-handle {
  position: fixed;
  opacity: 1;
  transition: opacity ease-in 0.2s;
  border-radius: 0.25rem;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(0, 0, 0, 0.5)'%3E%3Cpath d='M3,2 C2.44771525,2 2,1.55228475 2,1 C2,0.44771525 2.44771525,0 3,0 C3.55228475,0 4,0.44771525 4,1 C4,1.55228475 3.55228475,2 3,2 Z M3,6 C2.44771525,6 2,5.55228475 2,5 C2,4.44771525 2.44771525,4 3,4 C3.55228475,4 4,4.44771525 4,5 C4,5.55228475 3.55228475,6 3,6 Z M3,10 C2.44771525,10 2,9.55228475 2,9 C2,8.44771525 2.44771525,8 3,8 C3.55228475,8 4,8.44771525 4,9 C4,9.55228475 3.55228475,10 3,10 Z M7,2 C6.44771525,2 6,1.55228475 6,1 C6,0.44771525 6.44771525,0 7,0 C7.55228475,0 8,0.44771525 8,1 C8,1.55228475 7.55228475,2 7,2 Z M7,6 C6.44771525,6 6,5.55228475 6,5 C6,4.44771525 6.44771525,4 7,4 C7.55228475,4 8,4.44771525 8,5 C8,5.55228475 7.55228475,6 7,6 Z M7,10 C6.44771525,10 6,9.55228475 6,9 C6,8.44771525 6.44771525,8 7,8 C7.55228475,8 8,8.44771525 8,9 C8,9.55228475 7.55228475,10 7,10 Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
  background-repeat: no-repeat;
  background-position: center;
  width: 1.2rem;
  height: 1.5rem;
  z-index: 50;
  cursor: grab;

  &:hover {
    background-color: var(--novel-stone-100);
    transition: background-color 0.2s;
  }

  &:active {
    background-color: var(--novel-stone-200);
    transition: background-color 0.2s;
  }

  &.hide {
    opacity: 0;
    pointer-events: none;
  }

  @media screen and (max-width: 600px) {
    display: none;
    pointer-events: none;
  }
}

.ProseMirror {
  min-height: 100vh;
}
.ProseMirror-focused {
  border: none !important;
  outline: none !important;
}

.tiptap .is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
  .tiptap .is-empty::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

blockquote {
  margin: 0;
  padding-left: 2rem;
  border-left: 3px solid var(--text-action-high-blue-france);
}

`

const CustomDocument = Document.extend({
  content: 'heading block*',
})

export default function App() {
  const editor = useEditor({
    extensions: [
      GlobalDragHandle.configure({
        dragHandleWidth: 20, // default

        // The scrollTreshold specifies how close the user must drag an element to the edge of the lower/upper screen for automatic 
        // scrolling to take place. For example, scrollTreshold = 100 means that scrolling starts automatically when the user drags an 
        // element to a position that is max. 99px away from the edge of the screen
        // You can set this to 0 to prevent auto scrolling caused by this extension
        scrollTreshold: 100, // default

        // The css selector to query for the drag handle. (eg: '.custom-handle').
        // If handle element is found, that element will be used as drag handle. 
        // If not, a default handle will be created
        dragHandleSelector: ".drag-handle" // default is undefined
      }),
      SlashCommand,
      SIVideo,
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
      CodeBlock,
      Image,
      ImageSearch,
      VideoSearch,
      Underline,
      Link,
      FontFamily,
      Color,
      TextAlign,
      TextStyle,
      ImageResize,
      CharacterCount.configure({
        limit: 10000,
      }),
      Placeholder.configure({
        placeholder: (props) => {
          const { node, pos } = props;
          console.log("NODE", pos, node.type);
          if (node.type.name === 'heading') {
            if (pos === 0) {
              return 'Titre du cours';
            }
            return 'Titre';
          }
          return "";
          // return 'Ajouter du texte...';
        },
        // emptyNodeClass: 'is-empty',
        // considerAnyAsEmpty: true,
        showOnlyWhenEditable: false,
        showOnlyCurrent: false,


      }),

    ],
    content: `
    <h1>
    </h1>
  `,
  })

  const providerValue = useMemo(() => {
    return {
      title: "test",
    }
  }, [])

  if (!editor) {
    return null
  }
  return (
    <StyledEditor id="editor" style={{ minHeight: '100vh' }}>
      <EditorContext.Provider value={providerValue}>
        <EditorContent className="editor__content" editor={editor} style={{ minHeight: '100%' }} />
        <TextMenu editor={editor} />
      </EditorContext.Provider>
    </StyledEditor>
  )
}
