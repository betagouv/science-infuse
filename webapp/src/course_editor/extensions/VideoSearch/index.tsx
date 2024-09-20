import { mergeAttributes, Node } from '@tiptap/core'
import { Editor, ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react'
import VideoNode from './VideoNode'


declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    SiVideo: {
    };
  }
}
export default Node.create({
  name: 'si-video',

  group: 'block',
  draggable: true,

  atom: true,

  addAttributes() {
    return {
      startOffset: {
        default: 0,
      },
      endOffset: {
        default: 0,
      },
      chunk: {
        default: undefined
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'si-video',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['si-video', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNode)
  },
})