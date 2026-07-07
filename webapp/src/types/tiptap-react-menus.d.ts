declare module '@tiptap/react/menus' {
  import type { ComponentType, ReactNode } from 'react'
  import type { Editor } from '@tiptap/react'

  export type BubbleMenuProps = {
    children?: ReactNode
    editor: Editor
    pluginKey?: string
    shouldShow?: (props: any) => boolean
    updateDelay?: number
    tippyOptions?: Record<string, any>
  }

  export const BubbleMenu: ComponentType<BubbleMenuProps>
}
