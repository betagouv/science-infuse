"use client";

import React, { useState, useEffect } from 'react';
import { TiptapEditor, useTiptapEditor } from '@/course_editor';
import { Chapter } from '@prisma/client';
import { Editor, JSONContent } from '@tiptap/react';
import { TSeverity, useSnackbar } from '@/app/SnackBarProvider';
import { apiClient, ChapterWithoutBlocks } from '@/lib/api-client';
import CourseSettings from '@/course_editor/components/CourseSettings';



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



  const { editor, getContent, getTitle, setContent } = useTiptapEditor({ preview: true })


  useEffect(() => {
    if (editor && chapter) {
      const content = chapter.content;
      console.log("EDITORRR", editor, content)
      document.title = chapter.title
      editor.storage.simetadata.chapterId = chapter.id;
      editor.storage.simetadata.skills = chapter.skills;
      editor.storage.simetadata.educationLevels = chapter.educationLevels;
      editor.storage.simetadata.coverPath = chapter.coverPath
      // editor.storage.content.comments = content.storage.comments;
      setContent(typeof content === 'string' ? JSON.parse(content) : content as JSONContent)
    }
  }, [editor, chapter])

  return (
    <div className="py-16">
      <div className='w-full fr-grid-row fr-grid-row--center'>
        <div className="fr-col-12 fr-container main-content-item">
          {editor && <TiptapEditor editor={editor} />}
        </div>
      </div>
    </div>
  )


}
export default EditCourseChapter;