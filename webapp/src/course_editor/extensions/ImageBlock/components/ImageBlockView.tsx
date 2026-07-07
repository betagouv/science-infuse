// ImageBlockView.tsx
import { cn } from '@/lib/utils'
import { File } from '@prisma/client'
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useCallback, useRef } from 'react'

type ImageBlockAttrs = {
  src: string
  isUploading: boolean
  isLoaded: boolean
  userFile?: File
}

export const ImageBlockView = (props: NodeViewProps) => {
  const { editor, getPos, node } = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const { src, isUploading, isLoaded, userFile } = node.attrs as ImageBlockAttrs

  const wrapperClassName = cn(
    node.attrs.align === 'left' ? 'ml-0' : 'ml-auto',
    node.attrs.align === 'right' ? 'mr-0' : 'mr-auto',
    node.attrs.align === 'center' && 'mx-auto',
  )

  const onClick = useCallback(() => {
    const pos = getPos()
    if (typeof pos === 'number') {
      editor.commands.setNodeSelection(pos)
    }
  }, [getPos, editor.commands])

  return (
    <NodeViewWrapper>
      <div className={wrapperClassName} style={{ width: node.attrs.width }}>
        <div contentEditable={false} ref={imageWrapperRef}>
          <div className="relative">
            {(isUploading) && (
              <div className="flex w-full h-48 inset-0 items-center justify-center bg-gray-100 rounded-md">
                <svg className="w-8 h-8 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
            <img 
              className={cn(
                "block w-full transition-opacity duration-300 my-4",
                src ? "opacity-100" : "opacity-0"
              )} 
              src={src} 
              alt="" 
              onClick={onClick} 
            />
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default ImageBlockView
