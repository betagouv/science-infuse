import { Node, mergeAttributes } from '@tiptap/core'
import { NodeViewWrapper, NodeViewRenderer, ReactNodeViewRenderer } from '@tiptap/react'
import Image from '@tiptap/extension-image'
import React, { useState, useEffect, useRef } from 'react'
import { Range } from "@codegouvfr/react-dsfr/Range";

export interface ImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string, alt?: string, title?: string, width?: number, align?: string }) => ReturnType
    }
  }
}


const Left = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect width="6" height="14" x="4" y="5" rx="2"></rect><rect width="6" height="10" x="14" y="7" rx="2"></rect><path d="M4 2v20"></path><path d="M14 2v20"></path></svg>
const Center = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect width="6" height="14" x="4" y="5" rx="2"></rect><rect width="6" height="10" x="14" y="7" rx="2"></rect><path d="M17 22v-5"></path><path d="M17 7V2"></path><path d="M7 22v-3"></path><path d="M7 5V2"></path></svg>
const Right = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect width="6" height="14" x="4" y="5" rx="2"></rect><rect width="6" height="10" x="14" y="7" rx="2"></rect><path d="M10 2v20"></path><path d="M20 2v20"></path></svg>
export const ResizableImage = Image.extend<ImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: 100,
        parseHTML: element => parseInt(element.getAttribute('width') || '100'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: `${attributes.width}%`,
          }
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('align'),
        renderHTML: attributes => {
          if (!attributes.align) {
            return {}
          }
          return {
            align: attributes.align,
          }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },

  addCommands() {
    return {
      setImage: options => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { ...options, width: options.width || 100 },
        })
      },
    }
  },
})

const ImageNodeView: React.FC<{ node: Node, updateAttributes: Function }> = ({ node, updateAttributes }) => {
  const { src, alt, title, width, align } = node.attrs
  const [showControls, setShowControls] = useState(false)
  const [sliderValue, setSliderValue] = useState(width)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSliderValue(width)
  }, [width])

  const handleAlign = (newAlign: string) => {
    updateAttributes({ align: newAlign })
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value)
    setSliderValue(newWidth)
    updateAttributes({ width: newWidth })
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: `${width}%`,
    display: 'flex',
    ...(align === 'left' ? { marginRight: 'auto', } :
      align === 'right' ? { marginLeft: 'auto' } :
        { marginLeft: 'auto', marginRight: "auto" })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowControls(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <NodeViewWrapper>
      <div
        className='w-full my-8 relative'
        ref={containerRef}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <img
          src={src}
          alt={alt}
          title={title}
          style={containerStyle}
        // style={{ width: `${width}%`, display: 'block' }}
        />
        {true && (
          <div className='flex gap-4 w-fit top-0 justify-center items-center absolute -translate-x-[50%] -translate-y-[10%] bg-white rounded-md p-2 ml-[50%]'
            style={{
              transition: '0.2s',
              boxShadow: "0px 1px 50px -9px #000000",
              opacity: showControls ? 1 : 0,
            }}>
            <div style={{
              padding: '2px',
            }}>
              <button onClick={() => handleAlign('left')} style={{ opacity: align == "left" ? 1 : 0.5, padding: '4px 8px' }}><Left /></button>
              <button onClick={() => handleAlign('center')} style={{ opacity: align == "center" ? 1 : 0.5, padding: '4px 8px' }}><Center /></button>
              <button onClick={() => handleAlign('right')} style={{ opacity: align == "right" ? 1 : 0.5, padding: '4px 8px' }}><Right /></button>
            </div>
            <Range
              className=' bottom-2'
              hintText=""
              label=""
              max={100}
              min={25}
              small
              hideMinMax
              step={25}
              nativeInputProps={{
                value: sliderValue,
                onChange: handleSliderChange
              }}
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default ResizableImage