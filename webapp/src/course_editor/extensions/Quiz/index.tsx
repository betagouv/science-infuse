import { Extension } from '@tiptap/core'
import { Command, Editor, RawCommands, ReactRenderer } from '@tiptap/react'
import { Node as PMNode } from '@tiptap/pm/model'
import QuizPopup from './QuizPopup'

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        Quiz: {
            openQuizPopup: (pos: number, courseBlockNode: PMNode) => ReturnType;
        };
    }
}

export const QuizExtension = Extension.create({
    name: 'quiz',

    addCommands() {
        return {
            openQuizPopup:
                (pos: number, courseBlockNode: PMNode) =>
                    ({ editor, chain }) => {
                        let popupElement: HTMLDivElement | null = null;

                        const component = new ReactRenderer(QuizPopup, {
                            props: {
                                editor,
                                pos: pos,
                                courseBlockNode,
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

export default QuizExtension