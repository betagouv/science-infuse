import { apiClient } from '@/lib/api-client'
import { s3ToPublicUrl } from '@/types/vectordb'
import { File as DbFile } from '@prisma/client'
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { pdfjs } from 'react-pdf'
import PdfBlockView from './components/PdfBlockView'
import { TSeverity } from '@/types/snackbar'

// there is your `/legacy/build/pdf.worker.min.mjs` url
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();



type PdfBlockOptions = {
  showSnackbar: (message: string, severity: TSeverity) => void;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pdfBlock: {
      setPdfBlock: (attributes: { src: string }) => ReturnType
      setPdfBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType
      setPdfBlockUserFileAt: (attributes: { src: string; pos: number | Range, userFile: DbFile }) => ReturnType
      setPdfBlockShared: (shared: boolean) => ReturnType
      setFileShared: (shared: boolean) => ReturnType
      setPdfFromFile: (file: File, author?: string) => ReturnType
    }

  }
}


const PdfBlock = Node.create<PdfBlockOptions>({
  name: 'pdf',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      // ...this.parent(),
      showSnackbar: () => { },
    };
  },
  addAttributes() {
    return {
      isExternalFile: {
        default: false,
        parseHTML: element => element.getAttribute('data-isExternalFile'),
        renderHTML: attributes => ({
          'data-isExternalFile': attributes.isExternalFile,
        }),
      },
      userFile: {
        default: undefined,
      },
      isUploading: {
        default: false,
        parseHTML: () => false,
        renderHTML: () => ({}),
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
        parseHTML: element => element.getAttribute('data-shared'),
        renderHTML: attributes => ({
          'data-shared': attributes.shared,
        }),
      },
      src: {
        default: '',
        parseHTML: element => element.getAttribute('data-src'),
        renderHTML: attributes => ({
          'data-src': attributes.src,
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
      fileTypes: {
        default: [],
        parseHTML: element => element.getAttribute('data-fileTypes'),
        renderHTML: attributes => ({
          'data-fileTypes': attributes.fileTypes,
        }),
      },
      id: {
        default: '',
        parseHTML: element => element.getAttribute('data-id'),
        renderHTML: attributes => ({
          'data-id': attributes.id,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="pdf"]',
      },
    ]
  },

  addCommands() {
    return {
      setPdfFromFile:
        (file, author) =>
          ({ commands, view }) => {
            const uploadId = Math.random().toString(36).substr(2, 9)
            commands.insertContent({
              type: this.name,
              attrs: { src: '', isUploading: true, uploadId, isLoaded: false },
            })

            apiClient.uploadFile(file, author).then(data => {
              view.state.doc.descendants((node, pos) => {
                if (node.type.name === this.name && node.attrs.uploadId === uploadId) {
                  view.dispatch(
                    view.state.tr.setNodeMarkup(pos, null, {
                      ...node.attrs,
                      src: s3ToPublicUrl(data.s3ObjectName),
                      isUploading: false,
                      isExternalFile: true,
                      fileSource: author,
                      isLoaded: true,
                      userFile: file,
                      uploadId: null,
                      s3ObjectName: data.s3ObjectName,
                      id: data.id,
                    })
                  );
                  return false; // stop iteration
                }
              })
            })
              .catch(error => {
                console.error('File loading failed:', error);
                // Handle the failure case (e.g., show an error message to the user)
              });

            return true
          },


      setPdfBlock:
        attrs =>
          ({ commands }) => {
            return commands.insertContent({ type: this.name, attrs: { src: attrs.src } })
          },
      setPdfBlockUserFileAt:
        attrs =>
          ({ commands }) => {
            return commands.insertContentAt(attrs.pos as number, { type: this.name, attrs: { src: attrs.src, userFile: attrs.userFile } })
          },


      setPdfBlockAt:
        attrs =>
          ({ commands }) => {
            return commands.insertContentAt(attrs.pos as number, { type: this.name, attrs: { src: attrs.src } })
          },
    }
  },

  renderHTML({ HTMLAttributes, node }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'pdf',
      class: 'chapter-course-inline-pdf',
      style: 'border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 16px 0; background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%); text-align: center; font-family: system-ui, -apple-system, sans-serif;',
    }),
      ['div', { style: 'display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: #dc2626; color: white; font-size: 13px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.02em;' }, '📄 Document PDF'],
      ['p', { style: 'color: #374151; font-size: 15px; margin: 8px 0 16px 0; line-height: 1.5;' }, 'Un document PDF est inclus dans ce cours.'],
      ['div', { style: 'display: flex; justify-content: center;' },
        ['a', {
          href: node.attrs.src,
          download: '',
          style: 'display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; background-color: #dc2626; color: white; text-decoration: none; font-size: 14px; font-weight: 500;',
        }, '📥 Télécharger le PDF'],
      ],
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfBlockView)
  },
})

export default PdfBlock