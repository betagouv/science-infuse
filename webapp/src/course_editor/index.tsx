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
import ImageSearch from './extensions/ImageSearch'
import Image from '@tiptap/extension-image'
import SIVideo from './extensions/SIVideo'

const StyledEditor = styled.div`
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
        placeholder: ({ node, pos }) => {
          console.log("NODE", pos, node.type)
          if (node.type.name === 'heading') {
            if (pos == 0)
              return 'Titre du cours'
            return 'Titre'
          }
          // return 'Can you add some further context?'
        },
        // emptyNodeClass: 'is-empty',
        // considerAnyAsEmpty: true,
        showOnlyWhenEditable: false,
        showOnlyCurrent: false,


      }),

    ],
    content: `
    <h1>
      It’ll always have a heading …
    </h1>
    <p>
      … if you pass a custom document. That’s the beauty of having full control over the schema.
    </p>
     <si-video startOffset="89.82" endOffset="98.82" videoUrl="http://localhost:8000/s3/youtube/d18df3e7-374d-40dc-b4e5-3f2767c3c436.mp4"></si-video>
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
