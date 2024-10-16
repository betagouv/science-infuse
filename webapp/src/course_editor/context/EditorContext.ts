import { EducationLevel, SchoolSubject, Theme } from '@prisma/client'
import { createContext } from 'react'

interface IEditorContext {
  title?: string
  educationLevels: EducationLevel[],
  themes: Theme[],
  schoolSubjects: SchoolSubject[],
  // chapter: ChapterWithoutBlocks
}

export const EditorContext = createContext<IEditorContext>({
  title: "",
  educationLevels: [],
  themes: [],
  schoolSubjects: []
})
