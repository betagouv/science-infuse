"use client"
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import H5PRenderer from "@/app/(main)/mediaViewers/H5PRenderer"
import { useCallback, useState, useEffect } from 'react'

const alignToJustify: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
}

export const H5PBlockView = (props: NodeViewProps) => {
    const { node, editor, getPos, selected } = props
    const [interactive, setInteractive] = useState(false)
    const { width = '100%', align = 'center', h5pContentId } = node.attrs

    const handleClick = useCallback(() => {
        const pos = getPos()
        if (pos === undefined) return
        editor.commands.setNodeSelection(pos)
    }, [editor, getPos])

    const handleDoubleClick = useCallback(() => {
        setInteractive(true)
    }, [])

    useEffect(() => {
        if (!selected && interactive) {
            setInteractive(false)
        }
    }, [selected, interactive])

    return (
        <NodeViewWrapper
            className="h5p-block"
            data-drag-handle
            style={{
                display: 'flex',
                justifyContent: alignToJustify[align] || 'center',
            }}
        >
            <div style={{ width, position: 'relative' }}>
                {!interactive && (
                    <div
                        onClick={handleClick}
                        onDoubleClick={handleDoubleClick}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                            cursor: 'pointer',
                        }}
                    />
                )}
                <div 
                className='p-4 bg-white'
                style={{
                    border: selected ? '2px solid #4f46e5' : '2px solid transparent',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}>
                    <H5PRenderer key={`${h5pContentId}-${width}`} h5pContentId={h5pContentId} />
                </div>
            </div>
        </NodeViewWrapper>
    )
}
