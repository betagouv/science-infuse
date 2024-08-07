import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import React from 'react'
import { Document, Page } from 'react-pdf'
import { pdfjs } from 'react-pdf'
import PdfBlockView from './components/PdfBlockView'
import { apiClient } from '@/lib/api-client'
import { TSeverity } from '@/app/SnackBarProvider'


// there is your `/legacy/build/pdf.worker.min.mjs` url
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
  import.meta.url
).toString();



export type PdfBlockOptions = {
  showSnackbar: (message: string, severity: TSeverity) => void;
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pdfBlock: {
      setPdfBlock: (attributes: { src: string }) => ReturnType
      setPdfBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType
      setPdfBlockShared: (shared: boolean) => ReturnType
      setPdfFromFile: (file: File,) => ReturnType
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
        file =>
          ({ commands, view }) => {
            const uploadId = Math.random().toString(36).substr(2, 9)
            commands.insertContent({
              type: this.name,
              attrs: { src: '', isUploading: true, uploadId, isLoaded: false },
            })

            // TODO: fix pdf not available with s3 (delay, or retry)
            // function loadPdfWithRetry(url: string, retries = 5) {
            //   return new Promise((resolve, reject) => {
            //     const img = new Image();

            //     function onLoad() {
            //       resolve(url);
            //     }

            //     function onError() {
            //       if (retries > 0) {
            //         setTimeout(() => {
            //           loadPdfWithRetry(url, retries - 1).then(resolve).catch(reject);
            //         }, 1000);
            //       } else {
            //         reject(new Error('Failed to load image after several retries.'));
            //       }
            //     }

            //     img.onload = onLoad;
            //     img.onerror = onError;
            //     img.src = url;
            //   });
            // }


            apiClient.uploadFile(file).then(data => {
              console.log("DATA URL", data)
              view.state.doc.descendants((node, pos) => {
                if (node.type.name === this.name && node.attrs.uploadId === uploadId) {
                  view.dispatch(
                    view.state.tr.setNodeMarkup(pos, null, {
                      ...node.attrs,
                      src: data.url,
                      isUploading: false,
                      isExternalFile: true,
                      isLoaded: true,
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

      setPdfBlockAt:
        attrs =>
          ({ commands }) => {
            return commands.insertContentAt(attrs.pos as number, { type: this.name, attrs: { src: attrs.src } })
          },
    }
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'pdf' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfBlockView)
  },


})

export default PdfBlock