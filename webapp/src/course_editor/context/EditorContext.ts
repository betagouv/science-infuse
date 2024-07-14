import { createContext } from 'react'

interface IEditorContext {
  title?: string
}

export const EditorContext = createContext<IEditorContext>({
  title: "unset title",
})
