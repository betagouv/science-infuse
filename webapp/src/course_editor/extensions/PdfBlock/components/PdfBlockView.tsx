// PdfBlockView.tsx
import { cn } from '@/lib/utils'
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

type PdfBlockAttrs = {
  src: string
  isUploading: boolean
  isLoaded: boolean
  userFile?: File
}

export const PdfBlockView = (props: NodeViewProps) => {
  const { editor, getPos, node } = props
  const imageWrapperRef = useRef<HTMLDivElement>(null)
  const { src, isUploading, isLoaded } = node.attrs as PdfBlockAttrs

  const onClick = useCallback(() => {
    const pos = getPos()
    if (typeof pos === 'number') {
      editor.commands.setNodeSelection(pos)
    }
  }, [getPos, editor.commands])

  const [numPages, setNumPages] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  return (
    <NodeViewWrapper className="sm:rounded-xl sm:border sm:shadow-lg overflow-hidden my-4 relative">
      <div className="pdf-wrapper" ref={imageWrapperRef} style={{ maxHeight: '50vh', overflowY: 'auto', width: '100%' }}>
        <Document
          className={'w-full overflow-hidden'}
          file={node.attrs.src}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={(imageWrapperRef.current?.clientWidth||0)-20 || undefined}
            />
          ))}
        </Document>
        {/* {numPages && (
          <div className="pdf-info">
            Total pages: {numPages}
          </div>
        )} */}
      </div>
    </NodeViewWrapper>
  )
}

export default PdfBlockView
