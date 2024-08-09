import { Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view'

export default (editor: Editor, nodeType: string, placeholder?: string) => new Plugin({
    key: new PluginKey('introduction_backspace'),
    props: {
        handleKeyDown: (view: EditorView, event: KeyboardEvent) => {
            if (editor.isActive(nodeType)) {

                const { state } = view;
                const { selection } = state;
                const { $from } = selection;

                // Traverse up the document tree to find the 'introduction' node
                let introductionNode = null;
                let introductionNodePos = null;

                for (let i = $from.depth; i > 0; i--) {
                    const node = $from.node(i);
                    if (node.type.name === nodeType) {
                        introductionNode = node;
                        introductionNodePos = $from.before(i);
                        break;
                    }
                }

                const nodeSize = introductionNode?.nodeSize || 0
                // position of the carret relative to the introduction
                const carretPosition = $from.pos - (introductionNodePos || 0)
                const isNodeEmpty = nodeSize <= 4 // Accounting for the node's start and end

                if (introductionNodePos) {
                    const domElement = view.nodeDOM(introductionNodePos) as HTMLElement | null;
                    if (isNodeEmpty) {
                        domElement?.classList.add('is-empty')
                        if (placeholder)
                            domElement?.setAttribute('data-placeholder', placeholder);
                    }
                    else {
                        domElement?.classList.remove('is-empty')
                    }
                }

                // Prevent backspace if the node will be empty
                if (event.key === 'Backspace') {
                    if ((isNodeEmpty) || carretPosition <= 2) {
                        return true
                    }
                }
            }
            // Otherwise, let the Backspace key work as normal
            return false;
        }
    }
})
