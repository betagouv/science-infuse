"use client";

import { TiptapEditor, useTiptapEditor } from '@/course_editor';
import { apiClient } from '@/lib/api-client';
import { ChapterWithoutBlocks } from '@/types/api';
import CallOut from '@codegouvfr/react-dsfr/CallOut';
import { ChapterStatus } from '@prisma/client';
import { JSONContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';



const chapterRequests = new Map<string, Promise<ChapterWithoutBlocks>>()

const getChapterRequest = (chapterId: string) => {
  const existingRequest = chapterRequests.get(chapterId)

  if (existingRequest) {
    return existingRequest
  }

  const request = apiClient.getChapter(chapterId).finally(() => {
    setTimeout(() => {
      if (chapterRequests.get(chapterId) === request) {
        chapterRequests.delete(chapterId)
      }
    }, 30000)
  })

  chapterRequests.set(chapterId, request)
  return request
}

const EditCourseChapter = ({ params }: { params: { id: string } }) => {
  const [chapter, setChapter] = useState<ChapterWithoutBlocks | null>(null);
  const { editor, setContent } = useTiptapEditor({ preview: false })
  const appliedContentKeyRef = useRef<string | null>(null);
  const lastSavedContentRef = useRef("");
  const isApplyingRemoteContentRef = useRef(false);
  const baselineContentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  useEffect(() => {
    if (!params.id) return;

    let ignore = false;
    getChapterRequest(params.id).then(chapter => {
      if (!ignore) {
        setChapter(chapter);
      }
    })

    return () => {
      ignore = true;
    }
  }, [params.id]);


  // save editor on debounced content change
  const [debouncedEditor] = useDebounceValue(editor?.state.doc.content, 5000);
  useEffect(() => {
    if (editor && debouncedEditor) {
      if (isApplyingRemoteContentRef.current) {
        return;
      }

      const newContent = JSON.stringify(editor.getJSON())
      if (!lastSavedContentRef.current) {
        lastSavedContentRef.current = newContent;
        return;
      }

      if (newContent != lastSavedContentRef.current) {
        lastSavedContentRef.current = newContent;
        editor.commands.saveChapter();
      }
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
      const contentKey = `${chapter.id}:${typeof content === 'string' ? content : JSON.stringify(content)}`

      if (appliedContentKeyRef.current === contentKey) {
        return
      }

      appliedContentKeyRef.current = contentKey
      document.title = chapter.title
      editor.storage.simetadata.chapterId = chapter.id;
      editor.storage.simetadata.skills = chapter.skills;
      editor.storage.simetadata.educationLevels = chapter.educationLevels;
      editor.storage.simetadata.chapterStatus = chapter.status;
      // editor.storage.content.comments = content.storage.comments;
      isApplyingRemoteContentRef.current = true;
      setContent(typeof content === 'string' ? JSON.parse(content) : content as JSONContent)

      if (baselineContentTimeoutRef.current) {
        clearTimeout(baselineContentTimeoutRef.current);
      }

      baselineContentTimeoutRef.current = setTimeout(() => {
        lastSavedContentRef.current = JSON.stringify(editor.getJSON());
        isApplyingRemoteContentRef.current = false;
        baselineContentTimeoutRef.current = null;
      })
    }
  }, [editor, chapter, setContent])

  useEffect(() => {
    return () => {
      if (baselineContentTimeoutRef.current) {
        clearTimeout(baselineContentTimeoutRef.current);
      }
    }
  }, [])

  return (
    <>
      {editor && <TiptapEditor chapter={chapter} editor={editor} />}
    </>
  )


}
export default EditCourseChapter;
