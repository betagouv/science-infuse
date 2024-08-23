/* eslint-disable import/no-extraneous-dependencies */
import { getMarkRange, Mark, mergeAttributes } from '@tiptap/react';
import { Plugin, TextSelection } from 'prosemirror-state';

export interface CommentOptions {
    HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        comment: {
            /**
             * Set a comment mark
             */
            setThreadId: (comment: string) => ReturnType,
            /**
             * Toggle a comment mark
             */
            toggleComment: () => ReturnType,
            /**
             * Unset a comment mark
             */
            unsetThreadId: () => ReturnType,
        }
    }
}

const Comments = Mark.create<CommentOptions>({
    name: 'comment',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            threadId: {
                default: null,
                parseHTML: (el) => (el as HTMLSpanElement).getAttribute('data-threadId'),
                renderHTML: (attrs) => ({ 'data-threadId': attrs.threadId }),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-threadId]',
                getAttrs: (el) => !!(el as HTMLSpanElement).getAttribute('data-threadId')?.trim() && null,
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setThreadId: (threadId: string) => ({ commands }) => commands.setMark('comment', { threadId }),
            toggleComment: () => ({ commands }) => commands.toggleMark('comment'),
            unsetThreadId: () => ({ commands }) => commands.unsetMark('comment'),
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                props: {
                    handleClick(view, pos) {
                        const { schema, doc, tr } = view.state;

                        const range = getMarkRange(doc.resolve(pos), schema.marks.comment);

                        if (!range) return false;

                        const [$start, $end] = [doc.resolve(range.from), doc.resolve(range.to)];

                        view.dispatch(tr.setSelection(new TextSelection($start, $end)));

                        return true;
                    },
                },
            }),
        ];
    },
});

export default Comments;