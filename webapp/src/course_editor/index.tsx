'use client';

import { useSnackbar } from '@/app/SnackBarProvider';
import { EMPTY_DOCUMENT } from '@/config';
import styled from '@emotion/styled';
import { EducationLevel, Skill } from '@prisma/client';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Snackbar from './components/Snackbar';
import { EditorContext } from './context/EditorContext';
import "./editor.scss";
import { getExtensions } from './extensions';
import CommentView from './extensions/BubbleMenu/CommentView';
import FileBubbleMenu from './extensions/BubbleMenu/FileBubbleMenu';
import { TextMenu } from './extensions/BubbleMenu/TextMenu';
import EducationLevelPicker from './extensions/CourseBlock/EducationLevelPicker';
import SkillsPicker from './extensions/CourseBlock/SkillsPicker';
import CourseSettings from './components/CourseSettings';

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
  const providerValue = useMemo(() => {
    return {
      title: "test",
    }
  }, [])

  const [selectedEducationLevels, setSelectedEducationLevels] = useState<EducationLevel[]>(editor.storage.simetadata.educationLevels)
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(editor.storage.simetadata.skills)

  const updateSkills = useCallback((newSkills: Skill[]) => {
    editor.storage.simetadata.skills = [...newSkills];
    setSelectedSkills(newSkills);
  }, [editor]);

  const updateEducationLevel = useCallback((newEducationLevel: EducationLevel[]) => {
    console.log("newEducationLevel", newEducationLevel)
    editor.storage.simetadata.educationLevels = [...newEducationLevel];
    setSelectedEducationLevels(newEducationLevel);
  }, [editor]);


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
      {editor.isEditable && <div className="relative min-w-96 p-4 md:p-16">
        <CourseSettings editor={editor} />
      </div>}

      <StyledEditor
        id="editor"
        className='relative min-h-[500px] w-full sm:mb-[calc(20vh)] p-4 md:p-16' style={{ padding: !editor.isEditable ? "0" : '', minHeight: '100vh' }}
      >

        {editor.isEditable && <SkillsPicker
          selectedSkills={editor.storage.simetadata.skills}
          onSelectedSkills={updateSkills}
          className='mb-4' />}

        {editor.isEditable && <EducationLevelPicker
          selectedEducationLevels={editor.storage.simetadata.educationLevels}
          onSelectedEducationLevels={updateEducationLevel}
          className='mb-4' />}

        <div className="flex h-full" ref={menuContainerRef}>

          <EditorContext.Provider value={providerValue}>
            <EditorContent className="flex-1 w-full" editor={editor} style={{ minHeight: '100%' }} />
            {editor && <TextMenu editor={editor} />}
            <FileBubbleMenu editor={editor} appendTo={menuContainerRef} />
          </EditorContext.Provider>

        </div>
        <Snackbar />
      </StyledEditor>

    </div>
  )
}
