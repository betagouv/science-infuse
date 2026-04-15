import { PROJECT_NAME } from '@/config'
import { apiClient } from '@/lib/api-client'
import { Group } from '@/types/course-editor'
import { Editor } from '@tiptap/core'
import { Node as PMNode } from '@tiptap/pm/model'

function findCourseBlockNode(editor: Editor): PMNode | null {
  const { selection, doc } = editor.state
  const pos = selection.$from
  for (let depth = pos.depth; depth >= 0; depth--) {
    const node = pos.node(depth)
    if (node.type.name === 'courseBlock') {
      return node
    }
  }
  return null
}

export const GROUPS: Group[] = [
  {
    name: 'ScienceInfuse',
    title: 'ScienceInfuse',
    commands: [
      {
        name: 'newBlock',
        label: 'Nouveau Bloc',
        iconName: 'FilePlus2',
        description: 'Search and insert an image',
        action: async editor => {
          const newBlock = await apiClient.createBlock({
            title: `Nouveau Chapitre`,
            content: '[]',
            chapterId: editor.storage.simetadata.chapterId,
          })
          editor.chain().focus().setParagraph().insertContent('<p>&nbsp</p>').addCourseBlock(newBlock.id).run()
        },
        shouldBeHidden: editor => {
          return editor.state.selection.$from.depth > 0
        }
      },
      {
        name: 'si-content',
        label: `Contenu ${PROJECT_NAME}`,
        iconName: 'Image',
        description: `Insérer du contenu de ${PROJECT_NAME}`,
        action: async editor => {
          editor.chain().focus().openContentSearchPopup(editor.state.selection.anchor).run()
        },
      },
    ]
  },
  {
    name: 'interactifs',
    title: 'Contenus interactifs',
    commands: [
      {
        name: 'quiz',
        label: 'Quiz',
        iconName: 'CircleHelp',
        description: 'Générer un quiz interactif',
        action: async editor => {
          const courseBlockNode = findCourseBlockNode(editor)
          if (courseBlockNode) {
            editor.commands.openH5pPopup(courseBlockNode, 'quiz')
          }
        },
      },
      {
        name: 'texte-a-trous',
        label: 'Texte à trous',
        iconName: 'TextCursorInput',
        description: 'Générer un texte à trous interactif',
        action: async editor => {
          const courseBlockNode = findCourseBlockNode(editor)
          if (courseBlockNode) {
            editor.commands.openH5pPopup(courseBlockNode, 'texte-a-trous')
          }
        },
      },
      {
        name: 'dialogcards',
        label: 'Flash Cards',
        iconName: 'Layers',
        description: 'Générer des flash cards interactives',
        action: async editor => {
          const courseBlockNode = findCourseBlockNode(editor)
          if (courseBlockNode) {
            editor.commands.openH5pPopup(courseBlockNode, 'dialogcards')
          }
        },
      },
      {
        name: 'mots-croises',
        label: 'Mots croisés',
        iconName: 'Grid3x3',
        description: 'Générer des mots croisés interactifs',
        action: async editor => {
          const courseBlockNode = findCourseBlockNode(editor)
          if (courseBlockNode) {
            editor.commands.openH5pPopup(courseBlockNode, 'mots-croises')
          }
        },
      },
    ],
  },
  {
    name: 'format',
    title: 'Mise en page',
    commands: [
      {
        name: 'heading1',
        label: 'Titre',
        iconName: 'Heading1',
        description: 'High priority section title',
        aliases: ['h1'],
        action: async editor => {
          editor.chain().focus().setHeading({ level: 1 }).run()
        },
      },
      {
        name: 'heading2',
        label: 'Sous-titre 1',
        iconName: 'Heading2',
        description: 'Medium priority section title',
        aliases: ['h2'],
        action: async editor => {
          editor.chain().focus().setHeading({ level: 2 }).run()
        },
      },
      {
        name: 'heading3',
        label: 'Sous-titre 2',
        iconName: 'Heading3',
        description: 'Low priority section title',
        aliases: ['h3'],
        action: async editor => {
          editor.chain().focus().setHeading({ level: 3 }).run()
        },
      },
      {
        name: 'bulletList',
        label: 'Liste à puces',
        iconName: 'List',
        description: 'Unordered list of items',
        aliases: ['ul'],
        action: async editor => {
          editor.chain().focus().toggleBulletList().run()
        },
      },
      {
        name: 'numberedList',
        label: 'Liste numérotée',
        iconName: 'ListOrdered',
        description: 'Ordered list of items',
        aliases: ['ol'],
        action: async editor => {
          editor.chain().focus().toggleOrderedList().run()
        },
      },
      {
        name: 'blockquote',
        label: 'Blockquote',
        iconName: 'Quote',
        description: 'Element for quoting',
        action: async editor => {
          editor.chain().focus().setBlockquote().run()
        },
      },
      // {
      //   name: 'codeBlock',
      //   label: 'Code Block',
      //   iconName: 'SquareCode',
      //   description: 'Code block with syntax highlighting',
      //   shouldBeHidden: editor => editor.isActive('columns'),
      //   action: async editor => {
      //     editor.chain().focus().setCodeBlock().run()
      //   },
      // },
    ],
  },
  // {
  //   name: 'insert',
  //   title: 'Insert',
  //   commands: [
  //     {
  //       name: 'table',
  //       label: 'Table',
  //       iconName: 'Table',
  //       description: 'Insert a table',
  //       shouldBeHidden: editor => editor.isActive('columns'),
  //       action: async editor => {
  //         editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run()
  //       },
  //     },
  //     {
  //       name: 'horizontalRule',
  //       label: 'Horizontal Rule',
  //       iconName: 'Minus',
  //       description: 'Insert a horizontal divider',
  //       aliases: ['hr'],
  //       action: async editor => {
  //         editor.chain().focus().setHorizontalRule().run()
  //       },
  //     },
  //   ],
  // },
]

export default GROUPS
