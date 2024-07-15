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
                let tippyInstance: any;

                const component = new ReactRenderer(ImageSearchPopup, {
                    props: {
                        editor,
                        closePopup: () => {
                            if (tippyInstance) {
                                console.log("TIPPYINSTANCE", tippyInstance.popper)
                                tippyInstance.popper.querySelector('.tippy-box').style.opacity = '0'
                                setTimeout(() => {
                                    console.log("TIPPYINSTANCE DESTROY", tippyInstance)
                                    tippyInstance.destroy();
                                }, 400)
                            }
                        },
                    },
                    editor,
                });

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
                        }, 0)
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