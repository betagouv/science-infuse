import { mergeAttributes, Node } from '@tiptap/core'
import { Editor, ReactNodeViewRenderer } from '@tiptap/react'
import VideoNode from './VideoNode'
import { apiClient } from '@/lib/api-client'
import { s3ToPublicUrl } from '@/types/vectordb'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoBlock: {
      setVideoFromFile: (file: File, author?: string) => ReturnType
    }
  }
}

export interface VideoAttributes {
  startOffset: number
  endOffset: number
  chunk: any
  userFile: File | undefined
  isExternalFile: boolean
  uploadId: string | null
  isLoaded: boolean
  shared: boolean
  src: string
  s3ObjectName: string
  fileSource: string
  id: string
  fileTypes: string[]
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
      userFile: {
        default: undefined
      },
      isExternalFile: {
        default: false,
        parseHTML: element => element.getAttribute('data-isExternalFile') === 'true',
        renderHTML: attributes => ({
          'data-isExternalFile': attributes.isExternalFile,
        }),
      },
      uploadId: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
      isLoaded: {
        default: true,
        parseHTML: () => false,
        renderHTML: () => ({}),
      },
      shared: {
        default: false,
        parseHTML: element => element.getAttribute('data-shared') === 'true',
        renderHTML: attributes => ({
          'data-shared': attributes.shared,
        }),
      },
      src: {
        default: '',
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => ({
          src: attributes.src,
        }),
      },
      s3ObjectName: {
        default: '',
        parseHTML: element => element.getAttribute('data-s3ObjectName'),
        renderHTML: attributes => ({
          'data-s3ObjectName': attributes.s3ObjectName,
        }),
      },
      fileSource: {
        default: '',
        parseHTML: element => element.getAttribute('data-fileSource'),
        renderHTML: attributes => ({
          'data-fileSource': attributes.fileSource,
        }),
      },
      id: {
        default: '',
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => ({
          'data-id': attributes.id,
        }),
      },
      fileTypes: {
        default: [],
        parseHTML: element => element.getAttribute('data-fileTypes')?.split(',') || [],
        renderHTML: attributes => ({
          'data-fileTypes': attributes.fileTypes.join(','),
        }),
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

  addCommands() {
    return {
      setVideoFromFile:
        (file: File, author?: string) => ({ commands, view }) => {
          const uploadId = Math.random().toString(36).substr(2, 9)
          commands.insertContent({
            type: this.name,
            attrs: { src: '', isUploading: true, uploadId, isLoaded: false },
          })

          apiClient.uploadFile(file, author).then(userFile => {
            view.state.doc.descendants((node, pos) => {
              if (node.type.name === this.name && node.attrs.uploadId === uploadId) {
                view.dispatch(
                  view.state.tr.setNodeMarkup(pos, null, {
                    ...node.attrs,
                    src: s3ToPublicUrl(userFile.s3ObjectName),
                    isUploading: false,
                    isExternalFile: true,
                    fileSource: author,
                    isLoaded: true,
                    userFile: userFile,
                    uploadId: null,
                    s3ObjectName: userFile.s3ObjectName,
                    id: userFile.id,
                  })
                )
                return false // stop iteration
              }
            })
          })
            .catch(error => {
              console.error('File loading failed:', error)
              // Handle the failure case (e.g., show an error message to the user)
            })

          return true
        },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['si-video', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNode)
  },
})