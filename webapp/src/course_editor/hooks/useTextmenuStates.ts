import { ShouldShowProps } from '@/types/course-editor'
import { Editor } from '@tiptap/react'
import { useCallback } from 'react'
import { ImageBlock } from '../extensions/ImageBlock'
import PdfBlock from '../extensions/PdfBlock/PdfBlock'
import isTextSelected from '../utils/isTextSelected'

export const isCustomNodeSelected = (editor: Editor, node: HTMLElement) => {
  const customNodes = [
    ImageBlock.name,
    PdfBlock.name,
  ]
  return customNodes.some(type => editor.isActive(type)) //|| isTableGripSelected(node)
}


export const useTextmenuStates = (editor: Editor) => {
  const shouldShow = useCallback(
    ({ view, from }: ShouldShowProps) => {
      if (!view) {
        return false
      }

      const domAtPos = view.domAtPos(from || 0).node as HTMLElement
      const nodeDOM = view.nodeDOM(from || 0) as HTMLElement
      const node = nodeDOM || domAtPos
      if (nodeDOM && nodeDOM?.querySelector && (nodeDOM.querySelector('img') || nodeDOM.querySelector('video'))) {
        return false
      }
      if (isCustomNodeSelected(editor, node)) {
        return false
      }

      return isTextSelected({ editor })
    },
    [editor],
  )

  return {
    isBold: editor.isActive('bold'),
    isItalic: editor.isActive('italic'),
    isStrike: editor.isActive('strike'),
    isUnderline: editor.isActive('underline'),
    isCode: editor.isActive('code'),
    isComment: editor.isActive('comment'),
    isSubscript: editor.isActive('subscript'),
    isSuperscript: editor.isActive('superscript'),
    isAlignLeft: editor.isActive({ textAlign: 'left' }),
    isAlignCenter: editor.isActive({ textAlign: 'center' }),
    isAlignRight: editor.isActive({ textAlign: 'right' }),
    isAlignJustify: editor.isActive({ textAlign: 'justify' }),
    currentColor: editor.getAttributes('textStyle')?.color || undefined,
    currentHighlight: editor.getAttributes('highlight')?.color || undefined,
    currentFont: editor.getAttributes('textStyle')?.fontFamily || undefined,
    currentSize: editor.getAttributes('textStyle')?.fontSize || undefined,
    currentMessage: editor.view.state.doc.resolve(editor.view.state.selection.$from.pos + 1).marks().filter(mark => mark.type.name == 'comment').pop(),
    currentThreadId: editor.view.state.doc.resolve(editor.view.state.selection.$from.pos + 1).marks().filter(mark => mark.type.name == 'comment').pop()?.attrs?.threadId,
    shouldShow,
  }
}
