import { Extension } from '@tiptap/core'
import { Command, Editor, RawCommands, ReactRenderer } from '@tiptap/react'
import { Node as PMNode } from '@tiptap/pm/model'
import H5PPopup, { H5PContentType } from './H5PPopup'

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        Quiz: {
            openH5pPopup: (courseBlockNode: PMNode, h5PContentType: H5PContentType) => ReturnType;
        };
    }
}

export const QuizExtension = Extension.create({
    name: 'quiz',

    addCommands() {
        return {
            openH5pPopup:
                (courseBlockNode: PMNode, h5PContentType: H5PContentType) =>
                    ({ editor, chain }) => {
                        let popupElement: HTMLDivElement | null = null;

                        const component = new ReactRenderer(H5PPopup, {
                            props: {
                                editor,
                                courseBlockNode,
                                closePopup: () => {
                                    if (popupElement) {
                                        document.body.removeChild(popupElement);
                                        popupElement = null;
                                    }
                                },
                                h5PContentType,
                            },
                            editor,
                        })

                        popupElement = document.createElement('div');
                        popupElement.style.position = 'fixed';
                        popupElement.style.top = '0';
                        popupElement.style.left = '0';
                        popupElement.style.width = '100vw';
                        popupElement.style.height = '100vh';
                        popupElement.style.zIndex = '99999';
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

export default QuizExtension