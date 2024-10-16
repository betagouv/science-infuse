import { Editor as CoreEditor } from '@tiptap/core';
import { EditorState } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
// import { Editor } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import { icons } from 'lucide-react';
import { ChunkWithScoreUnion } from "./vectordb";


export type ContentTypePickerOption = {
  label: string
  id: string
  type: 'option'
  disabled: () => boolean
  isActive: () => boolean
  onClick: () => void
  icon: keyof typeof icons
}

export type ContentTypePickerCategory = {
  label: string
  id: string
  type: 'category'
}

export type ContentPickerOptions = Array<ContentTypePickerOption | ContentTypePickerCategory>

export type ContentTypePickerProps = {
  options: ContentPickerOptions
}


export interface Group {
  name: string
  title: string
  commands: Command[]
}

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'ghost'
export type ButtonSize = 'medium' | 'small' | 'icon' | 'iconSmall'

export type ButtonProps = {
  variant?: ButtonVariant
  active?: boolean
  activeClassname?: string
  buttonSize?: ButtonSize
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export interface Command {
  name: string
  label: string
  description: string
  aliases?: string[]
  iconName: keyof typeof icons
  action: (editor: Editor) => Promise<void>
  shouldBeHidden?: (editor: Editor) => boolean
}

export interface MenuListProps {
  editor: Editor
  items: Group[]
  command: (command: Command) => void
}

export interface ShouldShowProps {
  editor?: CoreEditor
  view: EditorView
  state?: EditorState
  oldState?: EditorState
  from?: number
  to?: number
}

export interface Option {
    answer: string;
    correct: boolean;
}

export interface Question {
    question: string;
    options: Option[];
}

export type OnInserted = {
    onInserted?: (chunk: ChunkWithScoreUnion) => void
  }
  