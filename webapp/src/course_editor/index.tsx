'use client';

import { useSnackbar } from '@/app/SnackBarProvider';
import { EMPTY_DOCUMENT } from '@/config';
import styled from '@emotion/styled';
import { Content, Editor, EditorContent, useEditor } from '@tiptap/react';
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
import { useDebounceValue } from 'usehooks-ts';

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

  const setContent = useCallback((content: Content) => {
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



export const TiptapEditor = (props: { chapterId?: string, editor: Editor }) => {

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

  return (
    <div className="flex flex-row mt-8" style={{ marginTop: editor.isEditable ? "" : "0" }}>
      <EditorContext.Provider value={providerValue}>
        <div className="flex flex-row gap-0 max-w-full w-full">

          <div className="relative p-4 md:p-16">
            <CourseSettings chapterId={props.chapterId} editor={editor} />
          </div>

          <StyledEditor id="editor" data-editable={editor.isEditable} className={`relative w-full sm:mb-[calc(20vh)] p-4 md:p-16`} style={{ padding: !editor.isEditable ? "0" : '', }}>

            {!editor.isEditable && editor.storage.simetadata.coverPath && <img className={'w-full'} src={editor.storage.simetadata.coverPath} />}

            <div className="flex flex-col" ref={menuContainerRef}>

              <EditorContent className="flex-1 w-full" editor={editor} />
              {editor && <TextMenu editor={editor} />}
              <FileBubbleMenu editor={editor} appendTo={menuContainerRef} />
              <AddBlockAtEnd editor={editor} />

            </div>
            <Snackbar />
          </StyledEditor>
        </div>

      </EditorContext.Provider>
    </div>
  )
}
