"use client"
import { apiClient } from '@/lib/api-client';
import { TSeverity } from '@/types/snackbar';
import { s3ToPublicUrl } from '@/types/vectordb';
import { File as DbFile } from '@prisma/client';
import { mergeAttributes, Range } from '@tiptap/core';
import { ImageOptions } from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeSelection } from 'prosemirror-state';
import { Image as TiptapImage } from '../Image';
import PdfBlock from '../PdfBlock/PdfBlock';
import VideoBlock from '../VideoBlock';
import { ImageBlockView } from './components/ImageBlockView';

type ImageBlockOptions = ImageOptions & {
  showSnackbar: (message: string, severity: TSeverity) => void;
};
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: { src: string }) => ReturnType
      setImageBlockAt: (attributes: { src: string; pos: number | Range }) => ReturnType
      setImageBlockUserFileAt: (attributes: { src: string; pos: number | Range, userFile: DbFile }) => ReturnType
      setImageBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setImageBlockWidth: (width: number) => ReturnType
      setFileShared: (shared: boolean) => ReturnType
      setFileSource: (source: string) => ReturnType
      setFileTypes: (fileTypes: string[]) => ReturnType
      setImageFromFile: (file: File,) => ReturnType
    }
  }
}

export const ImageBlock = TiptapImage.extend<ImageBlockOptions>({
  name: 'imageBlock',

  group: 'block',

  defining: true,

  draggable: true,

  isolating: true,

  addOptions() {
    return {
      ...this.parent?.(),
      showSnackbar: (message: string, severity: TSeverity) => { },
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
        parseHTML: element => element.getAttribute('data-fileTypes'),
        renderHTML: attributes => ({
          'data-fileTypes': attributes.fileTypes,
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

  renderHTML({ HTMLAttributes, node }) {
    console.log("RENDER IMAGE", node.attrs);
    let containerStyle = 'display: flex;';
    let imageStyle = '';
    const width = HTMLAttributes?.['data-width'];
    const align = HTMLAttributes?.['data-align'];
    const fileSource = node.attrs?.fileSource || node.attrs?.userFile?.author || "";
    const downloadLink = node.attrs?.src;
  
    if (width) {
      imageStyle += `width: ${width};`;
    }
  
    if (align) {
      switch(align) {
        case 'left':
          imageStyle += 'align-self: flex-start;';
          break;
        case 'center':
          imageStyle += 'align-self: center;';
          break;
        case 'right':
          imageStyle += 'align-self: flex-end;';
          break;
      }
    }
  
    console.log("CONTAINER STYLE", containerStyle);
    console.log("IMAGE STYLE", imageStyle);
  
    const imageAttributes = {
      ...this.options.HTMLAttributes,
      ...HTMLAttributes,
      style: imageStyle,
    };
  
    return ['div', { class: 'block-image', style: containerStyle },
      ['div', { style: 'display: flex; flex-direction: column;' },
        ['img', mergeAttributes(imageAttributes)],
        downloadLink && ['a', { href: downloadLink, target: '_blank', rel: 'noopener noreferrer' }, "télécharger l'image"],
        fileSource && ['p', { class: "file-source" }, `Source : ${fileSource}`],
      ]
    ];
  },
  addCommands() {
    return {
      setImageFromFile:
        file =>
          ({ commands, view }) => {
            const uploadId = Math.random().toString(36).substr(2, 9)
            commands.insertContent({
              type: this.name,
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


            apiClient.uploadFile(file).then(data => {
              console.log("DATA URL", data)
              loadImageWithRetry(s3ToPublicUrl(data.s3ObjectName))
                .then(validUrl => {
                  const img = new Image();
                  img.onload = () => {
                    view.state.doc.descendants((node, pos) => {
                      if (node.type.name === this.name && node.attrs.uploadId === uploadId) {
                        view.dispatch(
                          view.state.tr.setNodeMarkup(pos, null, {
                            ...node.attrs,
                            src: validUrl,
                            isUploading: false,
                            isExternalFile: true,
                            isLoaded: true,
                            userFile: file,
                            uploadId: null,
                            s3ObjectName: data.s3ObjectName,
                            id: data.id,
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
            return commands.insertContent({ type: this.name, attrs: { src: attrs.src } })
          },

      setImageBlockAt:
        attrs =>
          ({ commands }) => {
            return commands.insertContentAt(attrs.pos, { type: this.name, attrs: { src: attrs.src } })
          },
      setImageBlockUserFileAt:
        attrs =>
          ({ commands }) => {
            return commands.insertContentAt(attrs.pos, { type: this.name, attrs: { src: attrs.src, userFile: attrs.userFile } })
          },

      setImageBlockAlign:
        align =>
          ({ commands }) =>
            commands.updateAttributes(this.name, { align }),

      setImageBlockWidth:
        width =>
          ({ commands }) =>
            commands.updateAttributes(this.name, { width: `${Math.max(0, Math.min(100, width))}%` }),

      setFileSource:
        source =>
          ({ commands, editor, view }) => {
            const selection = editor?.state?.selection;
            const selectedNodeType = selection instanceof NodeSelection ? selection.node.type.name : undefined;
            if (!selectedNodeType || ![PdfBlock.name, ImageBlock.name, VideoBlock.name].includes(selectedNodeType)) {
              this.options.showSnackbar(`Impossible de modifier la source d'un bloc du type "${selectedNodeType}"`, "error");
              return true;
            }
            console.log("selectedNodeType", selectedNodeType)
            commands.updateAttributes(selectedNodeType, { fileSource: source })
            const s3ObjectName = editor.getAttributes(selectedNodeType).s3ObjectName
            const userFile = editor.getAttributes(selectedNodeType)?.userFile;
            console.log("s3ObjectNames3ObjectNames3ObjectNames3ObjectName", s3ObjectName)
            if (userFile) {
              apiClient.updateFile(userFile.id, { author: source }).then(() => {
                this.options.showSnackbar("Source mise à jour avec succès", "success");
              }).catch(() => {
                this.options.showSnackbar("Échec de la mise à jour de la source", "error");
              })
            }
            return true
          },
      setFileShared:
        shared =>
          ({ commands, editor, view }) => {
            const selection = editor?.state?.selection;
            const selectedNodeType = selection instanceof NodeSelection ? selection.node.type.name : undefined;
            if (!selectedNodeType || ![PdfBlock.name, ImageBlock.name, VideoBlock.name].includes(selectedNodeType)) {
              this.options.showSnackbar(`Impossible de partager un bloc du type "${selectedNodeType}"`, "error");
              return true;
            }
            console.log("selectedNodeType", selectedNodeType)
            commands.updateAttributes(selectedNodeType, { shared: shared })
            const s3ObjectName = editor.getAttributes(selectedNodeType).s3ObjectName
            console.log("s3ObjectNames3ObjectNames3ObjectNames3ObjectName", s3ObjectName)
            apiClient.shareFile(s3ObjectName, shared).then(() => {
              this.options.showSnackbar("Statut de partage mis à jour avec succès", "success");
            }).catch(() => {
              this.options.showSnackbar("Échec de la mise à jour du statut de partage", "error");
            })
            return true
          },
      setFileTypes:
        fileTypes =>
          ({ commands, editor }) => {
            commands.updateAttributes(this.name, { fileTypes: fileTypes })
            const selection = editor?.state?.selection;
            const selectedNodeType = selection instanceof NodeSelection ? selection.node.type.name : undefined;
            if (!selectedNodeType || ![PdfBlock.name, ImageBlock.name].includes(selectedNodeType)) {
              this.options.showSnackbar(`Impossible changer le type d'un bloc "${selectedNodeType}"`, "error");
              return true;
            }
            console.log("selectedNodeType", selectedNodeType)
            commands.updateAttributes(selectedNodeType, { fileTypes: fileTypes })
            const id = editor.getAttributes(selectedNodeType).id
            apiClient.updateFile(id, {}, fileTypes).then(() => {
              this.options.showSnackbar("Type de fichier mis à jour avec succès", "success");
            }).catch(() => {
              this.options.showSnackbar("Échec de la mise à jour du type de fichier", "error");
            })
            return true
          },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView)
  },
})

export default ImageBlock
