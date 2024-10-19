"use client";

import { TiptapEditor, useTiptapEditor } from '@/course_editor';
import { apiClient } from '@/lib/api-client';
import { ChapterWithoutBlocks } from '@/types/api';
import CallOut from '@codegouvfr/react-dsfr/CallOut';
import { ChapterStatus } from '@prisma/client';
import { JSONContent } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';



let prevContent = ""
const EditCourseChapter = ({ params }: { params: { id: string } }) => {
  const [chapter, setChapter] = useState<ChapterWithoutBlocks | null>(null);
  const { editor, setContent } = useTiptapEditor({ preview: false })


  useEffect(() => {
    const fetchChapter = async () => {
      apiClient.getChapter(params.id).then(chapter => {
        setChapter(chapter);
      })
    }
    fetchChapter();
  }, [params.id]);


  // save editor on debounced content change
  const [debouncedEditor] = useDebounceValue(editor?.state.doc.content, 5000);
  useEffect(() => {
    if (editor && debouncedEditor) {
      const newContent = JSON.stringify(editor.getJSON())
      if (newContent != prevContent && prevContent != "") {
        editor.commands.saveChapter();
      }
      prevContent = newContent;
    }
  }, [debouncedEditor, editor]);

  // save editor on ctrl+s press on whole page
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (editor && event.ctrlKey && event.key === 's') {
        event.preventDefault();
        editor.commands.saveChapter();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);



  useEffect(() => {
    if (editor && chapter && setContent) {
      const content = chapter.content;
      document.title = chapter.title
      editor.storage.simetadata.chapterId = chapter.id;
      editor.storage.simetadata.skills = chapter.skills;
      editor.storage.simetadata.educationLevels = chapter.educationLevels;
      editor.storage.simetadata.chapterStatus = chapter.status;
      console.log("EDITORRR", editor, content)
      // editor.storage.content.comments = content.storage.comments;
      setContent(typeof content === 'string' ? JSON.parse(content) : content as JSONContent)
    }
  }, [editor, chapter, setContent])

  return (
    <>
      {editor && <TiptapEditor chapter={chapter} editor={editor} />}
    </>
  )


}
export default EditCourseChapter;