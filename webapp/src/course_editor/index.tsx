'use client';

import { useSnackbar } from '@/app/SnackBarProvider';
import { EMPTY_DOCUMENT } from '@/config';
import styled from '@emotion/styled';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Snackbar from './components/Snackbar';
import { EditorContext } from './context/EditorContext';
import "./editor.scss";
import { getExtensions } from './extensions';
import FileBubbleMenu from './extensions/BubbleMenu/FileBubbleMenu';
import { TextMenu } from './extensions/BubbleMenu/TextMenu';
import CourseSettings from './components/CourseSettings';
import { apiClient } from '@/lib/api-client';
import { EducationLevel, SchoolSubject, Theme } from '@prisma/client';
import AddBlockAtEnd from './components/AddBlockAtEnd';

const StyledEditor = styled.div`
`


export const useTiptapEditor = (params: { preview?: boolean }) => {

  const { showSnackbar } = useSnackbar();

  const editor = useEditor({
    immediatelyRender: false,
    editable: !params?.preview,
    extensions: getExtensions(showSnackbar),
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

  const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [schoolSubjects, setSchoolSubjects] = useState<SchoolSubject[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [educationLevelsResponse, themesResponse, schoolSubjectsResponse] = await Promise.all([
          apiClient.getEducationLevels(),
          apiClient.getThemes(),
          apiClient.getSchoolSubject()
        ]);
        setEducationLevels(educationLevelsResponse);
        setThemes(themesResponse);
        setSchoolSubjects(schoolSubjectsResponse)
      } catch (error) {
        console.error('Error fetching data:', error);
        // showSnackbar('Error fetching education levels and themes', 'error');
      }
    };
    fetchData();
  }, []);


  const providerValue = useMemo(() => {
    return {
      title: "test",
      themes,
      educationLevels,
      schoolSubjects
    }
  }, [themes, educationLevels])

  // save editor on ctrl+s press on whole page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        editor.commands.save(editor);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);



  return (
    <div className="flex flex-row mt-8" style={{ marginTop: editor.isEditable ? "" : "0" }}>
      <EditorContext.Provider value={providerValue}>
        {editor.isEditable && <div className="relative min-w-96 p-4 md:p-16">
          <CourseSettings editor={editor} />
        </div>}

        <StyledEditor
          id="editor"
          className='relative w-full sm:mb-[calc(20vh)] p-4 md:p-16' style={{ padding: !editor.isEditable ? "0" : '', }}
        >

          <div className="flex flex-col" ref={menuContainerRef}>

            <EditorContent className="flex-1 w-full" editor={editor} />
            {editor && <TextMenu editor={editor} />}
            <FileBubbleMenu editor={editor} appendTo={menuContainerRef} />
            <AddBlockAtEnd editor={editor} />

          </div>
          <Snackbar />
        </StyledEditor>
      </EditorContext.Provider>
    </div>
  )
}
