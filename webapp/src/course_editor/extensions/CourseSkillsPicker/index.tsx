import React, { memo, useCallback, useEffect, useRef } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import { apiClient } from '@/lib/api-client';
import { TextSelection } from '@tiptap/pm/state'
import { Editor } from '@tiptap/core'
import { keymap } from '@tiptap/pm/keymap'
import Quiz, { Question } from './Quiz';
import { useState } from '@preact-signals/safe-react/react';
import { Node as PMNode } from '@tiptap/pm/model'
import { KeyIdea, Skill } from '@prisma/client';
import SkillsPicker from './SkillsPicker';

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    CourseSkillsPickerNode: {
      updateCourseSkills: (id: string, skills: string[]) => ReturnType;
    };
  }
}



const CourseSkillsPickerNode = Node.create({
  name: 'courseSkillsPicker',
  group: 'block',
  content: 'bulletList',

  addAttributes() {
    return {
      skills: {
        default: [],
        parseHTML: element => JSON.parse(element.getAttribute('data-skills') || '[]'),
        renderHTML: attributes => ({
          'data-skills': JSON.stringify(attributes.skills),
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="course-skills-picker"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'course-skills-picker', class: "course-skills-picker" }), 0]
  },
  addCommands() {
    return {
      // setCourseTitle: (title: string) => ({ tr, dispatch, chain, state, editor }) => {
      //   return false
      // }
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(CourseSkillsPicker)
  },
})


const CourseSkillsPicker = ({ node, selected, editor }: { node: PMNode; editor: Editor; selected: boolean; }) => {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>(editor.storage.simetadata.skills)

  const updateSkills = useCallback((newSkills: Skill[]) => {
    editor.storage.simetadata.skills = [...newSkills];
    setSelectedSkills(newSkills);
  }, [editor]);


  return (
    <NodeViewWrapper data-id={node.attrs.id} className="relative course-skills-picker">
      <div className="bg-[#f6f6f6] sm:rounded-xl sm:border sm:shadow-lg p-8 mb-8">
        <p className='pointer-events-none'>Compétences et notions clés :</p>
        {/* <SkillsPicker
          selectedSkills={editor.storage.simetadata.skills}
          onSelectedSkills={updateSkills}
          className='mb-4' /> */}
        <NodeViewContent className="content" />
      </div>
    </NodeViewWrapper>
  )
}

export default CourseSkillsPickerNode;