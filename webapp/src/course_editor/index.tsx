'use client';

import { Editor, EditorContent, useEditor } from '@tiptap/react'
import React, { useCallback, useMemo, useRef } from 'react'
import { EditorContext } from './context/EditorContext'
import { TextMenu } from './extensions/BubbleMenu/BubbleMenu'
import styled from '@emotion/styled'
import { getExtensions } from './extensions';
import "./editor.scss"
import { EMPTY_DOCUMENT } from '@/config';
import ImageBlockMenu from './extensions/ImageBlock/components/ImageBlockMenu';

const StyledEditor = styled.div`
`


export const useTiptapEditor = () => {

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getExtensions(),
    content: EMPTY_DOCUMENT,
  })

  const getContent = useCallback(() => {
    return editor?.getJSON() ?? ''
  }, [editor])

  const getTitle = useCallback(() => {
    return editor?.state.doc.firstChild?.textContent ?? ''
  }, [editor])

  const setContent = useCallback((content: string) => {
    // https://github.com/ueberdosis/tiptap/issues/3764
    setTimeout(() => {
      editor?.commands.setContent(content)
    })
  }, [editor])


  return {
    editor,
    getContent,
    getTitle,
    setContent,
  }
};

export const TiptapEditor = (props: { editor: Editor }) => {

  const { editor } = props;
  const menuContainerRef = useRef(null)
  const providerValue = useMemo(() => {
    return {
      title: "test",
    }
  }, [])

  return (
    <StyledEditor
      id="editor"
      className='container mx-auto relative min-h-[500px] w-full max-w-screen-lg border border-solid border-[#f1f5f9] bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg mt-8 p-4 md:p-16 ' style={{ minHeight: '100vh' }}
    >
      <div className="flex h-full" ref={menuContainerRef}>

        <EditorContext.Provider value={providerValue}>
          <EditorContent className="flex-1 overflow-y-auto" editor={editor} style={{ minHeight: '100%' }} />
          {editor && <TextMenu editor={editor} />}
          <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />

        </EditorContext.Provider>
      </div>
    </StyledEditor>
  )
}
