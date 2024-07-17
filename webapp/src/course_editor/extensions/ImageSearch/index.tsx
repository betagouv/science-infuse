import { Extension } from '@tiptap/core'
import { Command, Editor, RawCommands, ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import ImageSearchPopup from './ImageSearchPopup'

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
      ImageSearch: {
        openImageSearch: () => ReturnType;
      };
    }
  }

  
export const ImageSearchExtension = Extension.create({
    name: 'imageSearch',

    addCommands() {
        return {
            openImageSearch:
                () =>
                    ({ editor, chain }) => {
                        let tippyInstance: any;

                        const component = new ReactRenderer(ImageSearchPopup, {
                            props: {
                                editor,
                                closePopup: () => {
                                    if (tippyInstance) {
                                        tippyInstance.destroy();
                                    }
                                },
                            },
                            editor,
                        })

                        tippyInstance = tippy(document.body, {
                            getReferenceClientRect: () => {
                                const { view } = editor
                                const { state } = view
                                const { selection } = state
                                const { ranges } = selection
                                const from = Math.min(...ranges.map(range => range.$from.pos))
                                const to = Math.max(...ranges.map(range => range.$to.pos))
                                const domRect = view.coordsAtPos(from)
                                const domRectTo = view.coordsAtPos(to)
                                return new DOMRect(
                                    domRect.left,
                                    domRect.top,
                                    domRectTo.right - domRect.left,
                                    domRectTo.bottom - domRect.top
                                )
                            },
                            appendTo: () => document.body,
                            content: component.element,
                            onCreate(instance) {
                                setTimeout(() => {
                                    instance.popper.querySelector("input")?.focus()
                                }, 400)
                            },
                            showOnCreate: true,
                            interactive: true,
                            trigger: 'manual',
                            placement: 'bottom-start',
                        })

                        return chain().run();
                    },
        }
    },
})

export default ImageSearchExtension