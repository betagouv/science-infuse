"use client"
import { ReactNodeViewRenderer } from '@tiptap/react'
import { mergeAttributes, Range } from '@tiptap/core'

import { ImageBlockView } from './components/ImageBlockView'
import { Image as TiptapImage } from '../Image'
import { apiClient } from '@/lib/api-client'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string }) => ReturnType
      setImageBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType
      setImageBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setImageBlockWidth: (width: number) => ReturnType
      setImageBlockShared: (shared: boolean) => ReturnType
      setImageFromFile: (file: File, ) => ReturnType
    }

  }
}

export const ImageBlock = TiptapImage.extend({
  name: 'imageBlock',

  group: 'block',

  defining: true,

  isolating: true,

  addAttributes() {
    return {
      isExternalImage: {
        default: false,
        parseHTML: element => element.getAttribute('data-isExternalImage'),
        renderHTML: attributes => ({
          'data-isExternalImage': attributes.isExternalImage,
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
      externalSharePermission: {
        default: null,
        parseHTML: () => null,
        renderHTML: () => ({}),
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
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('data-width'),
        renderHTML: attributes => ({
          'data-width': attributes.width,
        }),
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align'),
        renderHTML: attributes => ({
          'data-align': attributes.align,
        }),
      },
      alt: {
        default: undefined,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src*="51.38.223.168"]:not([src^="data:"]), img[src*="localhost"]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addCommands() {
    return {
      setImageFromFile:
        file =>
          ({ commands, view }) => {
            const uploadId = Math.random().toString(36).substr(2, 9)
            commands.insertContent({
              type: 'imageBlock',
              attrs: { src: '', isUploading: true, uploadId, isLoaded: false },
            })

            function loadImageWithRetry(url: string, retries = 5) {
              return new Promise((resolve, reject) => {
                const img = new Image();

                function onLoad() {
                  resolve(url);
                }

                function onError() {
                  if (retries > 0) {
                    setTimeout(() => {
                      loadImageWithRetry(url, retries - 1).then(resolve).catch(reject);
                    }, 1000);
                  } else {
                    reject(new Error('Failed to load image after several retries.'));
                  }
                }

                img.onload = onLoad;
                img.onerror = onError;
                img.src = url;
              });
            }


            apiClient.uploadImage(file).then(data => {
              console.log("DATA URL", data)
              loadImageWithRetry(data.url)
                .then(validUrl => {
                  const img = new Image();
                  img.onload = () => {
                    view.state.doc.descendants((node, pos) => {
                      if (node.type.name === 'imageBlock' && node.attrs.uploadId === uploadId) {
                        view.dispatch(
                          view.state.tr.setNodeMarkup(pos, null, {
                            ...node.attrs,
                            src: validUrl,
                            isUploading: false,
                            isExternalImage: true,
                            isLoaded: true,
                            uploadId: null,
                            s3ObjectName: data.s3ObjectName
                          })
                        );
                        return false; // stop iteration
                      }
                    });
                  };
                  // @ts-ignore
                  img.src = validUrl;
                })
                .catch(error => {
                  console.error('Image loading failed:', error);
                  // Handle the failure case (e.g., show an error message to the user)
                });
            });

            return true
          },


      setImageBlock:
        attrs =>
          ({ commands }) => {
            return commands.insertContent({ type: 'imageBlock', attrs: { src: attrs.src } })
          },

      setImageBlockAt:
        attrs =>
          ({ commands }) => {
            return commands.insertContentAt(attrs.pos, { type: 'imageBlock', attrs: { src: attrs.src } })
          },

      setImageBlockAlign:
        align =>
          ({ commands }) =>
            commands.updateAttributes('imageBlock', { align }),

      setImageBlockWidth:
        width =>
          ({ commands }) =>
            commands.updateAttributes('imageBlock', { width: `${Math.max(0, Math.min(100, width))}%` }),

      setImageBlockShared:
        shared =>
          ({ commands }) => {
            commands.updateAttributes('imageBlock', { shared: shared })
            // apiClient.
            return true
          },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView)
  },
})

export default ImageBlock
