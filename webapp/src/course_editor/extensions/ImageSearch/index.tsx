import { Extension } from '@tiptap/core'
import { Editor, ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import ImageSearchPopup from './ImageSearchPopup'

export const ImageSearchExtension = Extension.create({
    name: 'imageSearch',

    // @ts-ignore
    addCommands() {
        return {
            openImageSearch: () => (props: { editor: Editor }) => {
                const { editor } = props;
                const component = new ReactRenderer(ImageSearchPopup, {
                    props: {
                        editor,
                    },
                    editor,
                })

                const popup = tippy(document.body, {
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
                        console.log("ONCREATE", instance)
                        setTimeout(() => {
                            // @ts-ignore
                            instance.popper.querySelector("input").focus()
                        }, 400)
                    },
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })

                return true
            },
        }
    },
})

export default ImageSearchExtension