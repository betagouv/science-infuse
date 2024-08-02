"use client";

import React, { useState, useEffect } from 'react';
import { TiptapEditor, useTiptapEditor } from '@/course_editor';
import { Chapter } from '@prisma/client';
import { Editor, JSONContent } from '@tiptap/react';


const saveBlocks = async (editorContent: JSONContent) => {
  const blocks = editorContent.content?.filter(element => element.type === "courseBlock")
  console.log("BLOCKS", blocks, editorContent)
  if (blocks && blocks.length > 0) {
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      if (block.attrs && block.attrs.id && block.content) {
        const blockId = block.attrs.id;
        const blockTitle = block.content[0]?.content?.[0]?.text || ""
        console.log(`Block ID: ${block.attrs.id}`)
        console.log('Block Content:', block.content)

        try {
          const response = await fetch(`/api/course/chapters/blocks/${blockId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: blockTitle, content: JSON.stringify(block.content) }),
          });

          if (response.ok) {
            // alert('Block saved successfully!');
          } else {
            throw new Error('Failed to update block');
          }
        } catch (error) {
          console.error('Error updating block:', error);
          alert('Failed to update block. Please try again.');
        }
      }
    }
  }
  return blocks
}

const handleSave = async (editor: Editor, chapterId: string, title: string, content: JSONContent | string) => {

  await saveBlocks(editor.getJSON())

  try {
    const response = await fetch(`/api/course/chapters/${chapterId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content: JSON.stringify(content) }),
    });

    if (response.ok) {
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
      console.log("CHAPTER CONTENT", chapter)
      setContent(JSON.parse(content))
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
    setContent('<h2>Updated Title</h2><img src="http://localhost:8000/s3/pdf/70cc4c0c-7d44-4ac7-a241-a0fb8820e380.pdf/images/d7fed59e-e565-482a-8e56-9e3592b11113.png"/>')
  }

  return (
    <div>
      <div>
        <button onClick={() => editor && chapter && handleSave(editor, chapter.id, getTitle(), getContent())}>save</button>
        <button onClick={handleGetContent}>Get Content</button>
        <button onClick={handleGetTitle}>Get Title</button>
        <button onClick={handleSetContent}>Set New Content</button>
      </div>
      {editor && <TiptapEditor editor={editor} />}
    </div>
  )


}
export default EditCourseChapter;