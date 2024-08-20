"use client";

import React, { useState, useEffect } from 'react';
import { TiptapEditor, useTiptapEditor } from '@/course_editor';
import { Chapter } from '@prisma/client';
import { Editor, JSONContent } from '@tiptap/react';
import { TSeverity, useSnackbar } from '@/app/SnackBarProvider';
import { apiClient, ChapterWithoutBlocks } from '@/lib/api-client';



const EditCourseChapter = ({ params }: { params: { id: string } }) => {
  const [chapter, setChapter] = useState<ChapterWithoutBlocks | null>(null);


  useEffect(() => {
    const fetchChapter = async () => {
      apiClient.getChapter(params.id).then(chapter => {
        setChapter(chapter);
      })
    }
    fetchChapter();
  }, [params.id]);



  const { editor, getContent, getTitle, setContent } = useTiptapEditor()


  useEffect(() => {
    console.log("EDITORRR", editor)
    if (editor && chapter) {
      const content = chapter.content as string;
      document.title = chapter.title
      editor.storage.simetadata.chapterId = chapter.id;
      editor.storage.simetadata.skills = chapter.skills;
      editor.storage.simetadata.educationLevels = chapter.educationLevels;
      setContent(JSON.parse(content))

    }
  }, [editor, chapter])

  return (
    <div>
      {editor && <TiptapEditor editor={editor} />}
    </div>
  )


}
export default EditCourseChapter;