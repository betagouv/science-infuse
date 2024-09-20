import { Extension } from '@tiptap/core'
import { Command, Editor, RawCommands, ReactRenderer } from '@tiptap/react'
import ContentSearch from './ContentSearchPopup'

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        ImageSearch: {
            openContentSearchPopup: (pos: number) => ReturnType;
        };
    }
}

export const ImageSearchExtension = Extension.create({
    name: 'imageSearch',

    addCommands() {
        return {
            openContentSearchPopup:
                (pos: number) =>
                    ({ editor, chain }) => {
                        let popupElement: HTMLDivElement | null = null;

                        const component = new ReactRenderer(ContentSearch, {
                            props: {
                                editor,
                                pos: pos,
                                closePopup: () => {
                                    if (popupElement) {
                                        document.body.removeChild(popupElement);
                                        popupElement = null;
                                    }
                                },
                            },
                            editor,
                        })

                        popupElement = document.createElement('div');
                        popupElement.style.position = 'fixed';
                        popupElement.style.top = '0';
                        popupElement.style.left = '0';
                        popupElement.style.width = '100vw';
                        popupElement.style.height = '100vh';
                        popupElement.style.zIndex = '999';
                        popupElement.appendChild(component.element);

                        document.body.appendChild(popupElement);

                        setTimeout(() => {
                            popupElement?.querySelector("input")?.focus();
                        }, 100);

                        return chain().run();
                    },
        }
    },
})

export default ImageSearchExtension