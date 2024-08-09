"use client";

import React, { useState, useEffect } from 'react';
import { TiptapEditor, useTiptapEditor } from '@/course_editor';
import { Chapter } from '@prisma/client';
import { Editor, JSONContent } from '@tiptap/react';
import { TSeverity, useSnackbar } from '@/app/SnackBarProvider';



const EditCourseChapter = ({ params }: { params: { id: string } }) => {
  const [chapter, setChapter] = useState<Chapter | null>(null);


  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const response = await fetch(`/api/course/chapters/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch chapter');
        const data = await response.json();
        setChapter(data);
      } catch (error) {
        console.error('Error fetching chapter:', error);
        alert('Failed to load chapter. Please try again.');
      }
    };
    if (params.id) {
      fetchChapter();
    }
  }, [params.id]);



  const { editor, getContent, getTitle, setContent } = useTiptapEditor()


  useEffect(() => {
    console.log("EDITORRR", editor)
    if (editor && chapter) {
      const content = chapter.content as string;
      setContent(JSON.parse(content))
      editor.storage.simetadata.chapterId = chapter.id;
    }
  }, [editor, chapter])

  return (
    <div>
      {editor && <TiptapEditor editor={editor} />}
    </div>
  )


}
export default EditCourseChapter;