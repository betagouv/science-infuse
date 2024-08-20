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
    if (editor && chapter) {
      const content = JSON.parse(chapter.content as string);
      console.log("EDITORRR", editor, content)
      document.title = chapter.title
      editor.storage.simetadata.chapterId = chapter.id;
      editor.storage.simetadata.skills = chapter.skills;
      editor.storage.simetadata.educationLevels = chapter.educationLevels;
      // editor.storage.content.comments = content.storage.comments;
      setContent(content)

    }
  }, [editor, chapter])

  return (
    <div>
      {editor && <TiptapEditor editor={editor} />}
    </div>
  )


}
export default EditCourseChapter;