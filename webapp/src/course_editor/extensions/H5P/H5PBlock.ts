"use client"
import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { H5PBlockView } from './H5PBlockView'

export type H5PContentType = 'quiz' | 'texte-a-trous' | 'dialogcards' | 'mots-croises';

const contentTypeLabels: Record<H5PContentType, string> = {
    'quiz': 'Quiz',
    'texte-a-trous': 'Texte à trous',
    'dialogcards': 'Flash Cards',
    'mots-croises': 'Mots croisés',
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        h5pBlock: {
            insertH5PBlock: (attributes: { h5pContentId: string; h5pContentType?: H5PContentType }) => ReturnType
            setH5PBlockWidth: (width: number) => ReturnType
            setH5PBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
        }
    }
}

export const H5PBlock = Node.create({
    name: 'h5pBlock',

    group: 'block',

    draggable: true,

    atom: true,

    addAttributes() {
        return {
            h5pContentId: {
                default: null,
                parseHTML: element => element.getAttribute('data-h5p-content-id'),
                renderHTML: attributes => ({
                    'data-h5p-content-id': attributes.h5pContentId,
                }),
            },
            h5pContentType: {
                default: null,
                parseHTML: element => element.getAttribute('data-h5p-content-type'),
                renderHTML: attributes => ({
                    'data-h5p-content-type': attributes.h5pContentType,
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
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-h5p-content-id]',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        const h5pId = HTMLAttributes['data-h5p-content-id'] || ''
        const contentType = HTMLAttributes['data-h5p-content-type'] as H5PContentType | null
        const label = contentType ? contentTypeLabels[contentType] || 'Contenu interactif' : 'Contenu interactif'
        const baseUrl = process.env.NEXT_PUBLIC_WEBAPP_URL || ''
        const h5pUrl = `${baseUrl}/api/export/h5p?id=${h5pId}&name=h5p-content&media=h5p`
        const htmlUrl = `${baseUrl}/api/export/h5p?id=${h5pId}&name=h5p-content&media=html`

        return ['div', mergeAttributes({ 'data-type': 'h5p-block', style: 'border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 16px 0; background: linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%); text-align: center; font-family: system-ui, -apple-system, sans-serif;' }, HTMLAttributes),
            ['div', { style: 'display: inline-block; padding: 6px 16px; border-radius: 20px; background-color: #4f46e5; color: white; font-size: 13px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.02em;' }, `🎓 ${label}`],
            ['p', { style: 'color: #374151; font-size: 15px; margin: 8px 0 16px 0; line-height: 1.5;' }, `Ce contenu interactif (${label}) est disponible en téléchargement :`],
            ['div', { style: 'display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;' },
                ['a', { href: h5pUrl, style: 'display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; background-color: #4f46e5; color: white; text-decoration: none; font-size: 14px; font-weight: 500; transition: background-color 0.2s;', download: '' }, '📦 Télécharger H5P'],
                ['a', { href: htmlUrl, style: 'display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; background-color: #059669; color: white; text-decoration: none; font-size: 14px; font-weight: 500; transition: background-color 0.2s;', download: '' }, '🌐 Télécharger HTML'],
            ],
        ]
    },

    addCommands() {
        return {
            insertH5PBlock:
                (attrs) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: { h5pContentId: attrs.h5pContentId, h5pContentType: attrs.h5pContentType || null },
                        })
                    },
            setH5PBlockWidth:
                (width) =>
                    ({ commands }) =>
                        commands.updateAttributes(this.name, { width: `${Math.max(0, Math.min(100, width))}%` }),
            setH5PBlockAlign:
                (align) =>
                    ({ commands }) =>
                        commands.updateAttributes(this.name, { align }),
        }
    },

    addNodeView() {
        return ReactNodeViewRenderer(H5PBlockView)
    },
})

export default H5PBlock
