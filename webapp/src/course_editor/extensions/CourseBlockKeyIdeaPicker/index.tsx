import React, {  } from 'react'
import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import { Editor } from '@tiptap/core'
import { Node as PMNode } from '@tiptap/pm/model'

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    CourseBlockKeyIdeaPickerNode: {
    };
  }
}



const CourseBlockKeyIdeaPickerNode = Node.create({
  name: 'courseBlockKeyIdeaPicker',
  group: 'block',
  content: 'bulletList',

  addAttributes() {
    return {
      keyIdeas: {
        default: [],
        parseHTML: element => JSON.parse(element.getAttribute('data-keyIdeas') || '[]'),
        renderHTML: attributes => ({
          'data-keyIdeas': JSON.stringify(attributes.keyIdeas),
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="course-block-keyidea-picker"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'course-block-keyidea-picker', class: "course-block-keyidea-picker" }), 0]
  },
  addNodeView() {
    return ReactNodeViewRenderer(CourseBlockKeyIdeaPicker)
  },
})


const CourseBlockKeyIdeaPicker = ({ node, selected, editor }: { node: PMNode; editor: Editor; selected: boolean; }) => {
  // const [selectedSkills, setSelectedSkills] = useState<Skill[]>(editor.storage.simetadata.skills)

  // const updateSkills = useCallback((newSkills: Skill[]) => {
  //   editor.storage.simetadata.skills = [...newSkills];
  //   setSelectedSkills(newSkills);
  // }, [editor]);


  return (
    <NodeViewWrapper data-id={node.attrs.id} className="relative chapter-skills-picker">
      <div className="bg-[#f6f6f6] sm:rounded-xl sm:border sm:shadow-lg p-8 mb-8">
        <p className='pointer-events-none'>Idée-clé :</p>
        {/* <SkillsPicker
          selectedSkills={editor.storage.simetadata.skills}
          onSelectedSkills={updateSkills}
          className='mb-4' /> */}
        <NodeViewContent className="content" />
      </div>
    </NodeViewWrapper>
  )
}

export default CourseBlockKeyIdeaPickerNode;