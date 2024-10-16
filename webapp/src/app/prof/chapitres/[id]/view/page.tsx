"use client";

import React, { useState, useEffect } from 'react';
import { TiptapEditor, useTiptapEditor } from '@/course_editor';
import { JSONContent } from '@tiptap/react';
import { apiClient } from '@/lib/api-client';
import { ChapterWithoutBlocks } from '@/types/api';



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
      setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const blockId = urlParams.get('block');
        
        const blockNode = document.querySelector(`[data-id="${blockId}"]`)
        if (blockNode) {
          blockNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 400)

    }
  }, [editor, chapter])

  return (
    <div className="py-16">
      <div className='w-full fr-grid-row fr-grid-row--center'>
        <div className="fr-col-12 fr-container main-content-item">
          {editor && <TiptapEditor chapterId={chapter?.id} editor={editor} />}
        </div>
      </div>
    </div>
  )


}
export default EditCourseChapter;