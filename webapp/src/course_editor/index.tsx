'use client';

import { Editor, EditorContent, useEditor } from '@tiptap/react'
import React, { useCallback, useMemo, useRef, useEffect } from 'react'
import { EditorContext } from './context/EditorContext'
import { TextMenu } from './extensions/BubbleMenu/TextMenu'
import styled from '@emotion/styled'
import { getExtensions } from './extensions';
import "./editor.scss"
import { EMPTY_DOCUMENT } from '@/config';
import FileBubbleMenu from './extensions/BubbleMenu/FileBubbleMenu';
import { Alert, Snackbar, Slide } from '@mui/material';
import { useSnackbar } from '@/app/SnackBarProvider';

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
  const { snackbar, hideSnackbar } = useSnackbar();
  const menuContainerRef = useRef(null)
  const providerValue = useMemo(() => {
    return {
      title: "test",
    }
  }, [])

  const [key, setKey] = React.useState(0);

  useEffect(() => {
    if (snackbar.open) {
      setKey(prevKey => prevKey + 1);
    }
  }, [snackbar.open, snackbar.message]);

  return (
    <StyledEditor
      id="editor"
      className='container mx-auto relative min-h-[500px] w-full max-w-screen-lg border border-solid border-[#f1f5f9] bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg mt-8 p-4 md:p-16 ' style={{ minHeight: '100vh' }}
    >
      <div className="flex h-full" ref={menuContainerRef}>

        <EditorContext.Provider value={providerValue}>
          <EditorContent className="flex-1" editor={editor} style={{ minHeight: '100%' }} />
          {editor && <TextMenu editor={editor} />}
          <FileBubbleMenu editor={editor} appendTo={menuContainerRef} />

        </EditorContext.Provider>

        <Snackbar
          key={key}
          open={snackbar.open}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={Slide}
          TransitionProps={{ dir: "up" }}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </StyledEditor>
  )
}
