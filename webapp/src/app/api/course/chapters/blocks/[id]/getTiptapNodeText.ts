import { JSONContent } from "@tiptap/core";

export const getTiptapNodeText = (node: JSONContent, depth = 0) => {
    if (typeof node === 'string') {
        return node;
    }

    let text = '';
    const indent = '  '.repeat(depth);

    if (node.type === 'paragraph') {
        text += '\n' + indent;
    } else if (node.type === 'hardBreak') {
        text += '\n' + indent;
    } else if (node.type === 'bulletList' || node.type === 'orderedList') {
        text += '\n';
    } else if (node.type === 'listItem') {
        text += indent + '• ';
    }

    if (node.content) {
        text += node.content.map(child => getTiptapNodeText(child, depth + 1)).join('');
    } else if (node.text) {
        text += node.text;
    }

    if (node.type === 'paragraph' || node.type === 'listItem') {
        text += '\n';
    }

    return text;
};
