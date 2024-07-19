"use client";

import React, { useState, useEffect } from 'react';
import { CourseChapter } from '@prisma/client';
import { TiptapEditor, useTiptapEditor } from '@/course_editor';

const handleSave = async (chapterId: string, title: string, content: string) => {

  try {
    const response = await fetch(`/api/course/chapters/${chapterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.ok) {
      alert('Course chapter updated successfully!');
    } else {
      throw new Error('Failed to update course chapter');
    }
  } catch (error) {
    console.error('Error updating course chapter:', error);
    alert('Failed to update course chapter. Please try again.');
  } finally {
  }
};



const EditCourseChapter = ({ params }: { params: { id: string } }) => {
  const [chapter, setChapter] = useState<CourseChapter | null>(null);


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
      setContent(chapter.content)
      editor.storage.simetadata.chapterId = chapter.id;
    }
  }, [editor, chapter])

  const handleGetContent = () => {
    console.log('Current content:', getContent())
  }

  const handleGetTitle = () => {
    console.log('Current title:', getTitle())
  }

  const handleSetContent = () => {
    setContent('<h2>Updated Title</h2><p>This content was set from the parent component.</p>')
  }

  return (
    <div>
      <div>
        <button onClick={() => chapter && handleSave(chapter.id, getTitle(), getContent())}>save</button>
        <button onClick={handleGetContent}>Get Content</button>
        <button onClick={handleGetTitle}>Get Title</button>
        <button onClick={handleSetContent}>Set New Content</button>
      </div>
      {editor && <TiptapEditor editor={editor} />}
    </div>
  )


}
export default EditCourseChapter;