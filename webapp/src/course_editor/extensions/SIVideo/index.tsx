import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import VideoNode from './VideoNode'


export default Node.create({
  name: 'siVideo',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      startOffset: {
        default: 0,
      },
      endOffset: {
        default: 0,
      },
      videoUrl: {
        default: "",
      },
      videoTitle: {
        default: "",
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