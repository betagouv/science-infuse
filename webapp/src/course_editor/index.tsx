'use client';

import { Editor, EditorContent, useEditor } from '@tiptap/react'
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { EditorContext } from './context/EditorContext'
import { TextMenu } from './extensions/BubbleMenu/TextMenu'
import styled from '@emotion/styled'
import { getExtensions } from './extensions';
import "./editor.scss"
import { EMPTY_DOCUMENT } from '@/config';
import FileBubbleMenu from './extensions/BubbleMenu/FileBubbleMenu';
import SkillsPicker from './extensions/CourseBlock/SkillsPicker';
import { useSnackbar } from '@/app/SnackBarProvider';
import Snackbar from './components/Snackbar';
import { EducationLevel, Skill } from '@prisma/client';
import EducationLevelPicker from './extensions/CourseBlock/EducationLevelPicker';
import CommentView from './extensions/BubbleMenu/CommentView';

const StyledEditor = styled.div`
`


export const useTiptapEditor = () => {

  const { showSnackbar } = useSnackbar();

  const editor = useEditor({
    immediatelyRender: false,
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

  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(editor.storage.simetadata.skills)
  const [selectedEducationLevels, setSelectedEducationLevels] = useState<EducationLevel[]>(editor.storage.simetadata.educationLevels)

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
    <StyledEditor
      id="editor"
      className='container mx-auto relative min-h-[500px] w-full max-w-screen-lg border border-solid border-[#f1f5f9] bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg mt-8 p-4 md:p-16 ' style={{ minHeight: '100vh' }}
    >

      <SkillsPicker
        selectedSkills={editor.storage.simetadata.skills}
        onSelectedSkills={updateSkills}
        className='mb-4' />

      <EducationLevelPicker
        selectedEducationLevels={editor.storage.simetadata.educationLevels}
        onSelectedEducationLevels={updateEducationLevel}
        className='mb-4' />

      <div className="flex h-full" ref={menuContainerRef}>

        <EditorContext.Provider value={providerValue}>
          <EditorContent className="flex-1 w-full" editor={editor} style={{ minHeight: '100%' }} />
          {editor && <TextMenu editor={editor} />}
          <FileBubbleMenu editor={editor} appendTo={menuContainerRef} />
        </EditorContext.Provider>

      </div>
      <Snackbar />
    </StyledEditor>
  )
}
