import { mergeAttributes, Node } from '@tiptap/core'
import { Editor, ReactNodeViewRenderer, ReactRenderer } from '@tiptap/react'
import VideoNode from './VideoNode'
import VideoSearchPopup from './VideoSearchPopup'
import tippy from 'tippy.js'


declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    SiVideo: {
      openVideoSearch: () => ReturnType;
    };
  }
}
export default Node.create({
  name: 'si-video',

  group: 'block',
  draggable: true,

  atom: true,

  addAttributes() {
    return {
      startOffset: {
        default: 0,
      },
      endOffset: {
        default: 0,
      },
      videoUrl: {
        default: "",
      },
      videoTitle: {
        default: "",
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'si-video',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['si-video', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNode)
  },
  addCommands() {
    return {
      openVideoSearch: () => ({editor, chain}) => {
        let tippyInstance: any;

        const component = new ReactRenderer(VideoSearchPopup, {
          props: {
            closePopup: () => {
              if (tippyInstance) {
                console.log("TIPPYINSTANCE", tippyInstance.popper)
                tippyInstance.popper.querySelector('.tippy-box').style.opacity = '0'
                setTimeout(() => {
                  console.log("TIPPYINSTANCE DESTROY", tippyInstance)
                  tippyInstance.destroy();
                }, 400)
              }
            },
            editor,
          },
          editor,
        });



        tippyInstance = tippy(document.body, {
          getReferenceClientRect: () => {
            const { view } = editor
            const { state } = view
            const { selection } = state
            const { ranges } = selection
            const from = Math.min(...ranges.map(range => range.$from.pos))
            const to = Math.max(...ranges.map(range => range.$to.pos))
            const domRect = view.coordsAtPos(from)
            const domRectTo = view.coordsAtPos(to)
            return new DOMRect(
              domRect.left,
              domRect.top,
              domRectTo.right - domRect.left,
              domRectTo.bottom - domRect.top
            )
          },
          appendTo: () => document.body,
          content: component.element,
          onCreate(instance: any) {
            console.log("ONCREATE", instance)
            setTimeout(() => {
              // @ts-ignore
              instance.popper.querySelector("input").focus()
            }, 0)
          },
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          maxWidth: '1000px',
        })

        return chain().run();
      },
    }
  },
})