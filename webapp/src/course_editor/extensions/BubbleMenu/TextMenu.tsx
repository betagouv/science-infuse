import { BubbleMenu, Editor } from '@tiptap/react'
import { memo } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { Toolbar } from '@/course_editor/components/ui/Toolbar'
import { useTextmenuCommands } from '@/course_editor/hooks/useTextmenuCommands'
import { useTextmenuStates } from '@/course_editor/hooks/useTextmenuStates'
import { Icon } from '@/course_editor/components/ui/Icon'
import { Surface } from '@/course_editor/components/ui/Surface'
import { ColorPicker } from '@/course_editor/panels/Colorpicker'
import { FontSizePicker } from './FontSizePicker'
import { ContentTypePicker } from './ContentTypePicker'
import { useTextmenuContentTypes } from '@/course_editor/hooks/useTextmenuContentTypes'
import CommentView from './CommentView'

// We memorize the button so each button is not rerendered
// on every editor state change
const MemoButton = memo(Toolbar.Button)
const MemoColorPicker = memo(ColorPicker)
const MemoFontSizePicker = memo(FontSizePicker)
const MemoContentTypePicker = memo(ContentTypePicker)

export type TextMenuProps = {
  editor: Editor
}

export const TextMenu = ({ editor }: TextMenuProps) => {
  const commands = useTextmenuCommands(editor)
  const states = useTextmenuStates(editor)
  const blockOptions = useTextmenuContentTypes(editor)
  const { currentMessage } = useTextmenuStates(editor);

  return (
    <BubbleMenu
      tippyOptions={{ popperOptions: { placement: 'top-start' }, zIndex: 999 }}
      editor={editor}
      pluginKey="textMenu"
      shouldShow={states.shouldShow}
      updateDelay={100}
    >
      <Toolbar.Wrapper>
        <MemoContentTypePicker options={blockOptions} />
        {/* <MemoFontSizePicker onChange={commands.onSetFontSize} value={states.currentSize || ''} /> */}
        <MemoButton tooltip="Bold" tooltipShortcut={['Mod', 'B']} onClick={commands.onBold} active={states.isBold}>
          <Icon name="Bold" />
        </MemoButton>
        <MemoButton
          tooltip="Italic"
          tooltipShortcut={['Mod', 'I']}
          onClick={commands.onItalic}
          active={states.isItalic}
        >
          <Icon name="Italic" />
        </MemoButton>
        <MemoButton
          tooltip="Underline"
          tooltipShortcut={['Mod', 'U']}
          onClick={commands.onUnderline}
          active={states.isUnderline}
        >
          <Icon name="Underline" />
        </MemoButton>
        <MemoButton
          tooltip="Strikehrough"
          tooltipShortcut={['Mod', 'Shift', 'S']}
          onClick={commands.onStrike}
          active={states.isStrike}
        >
          <Icon name="Strikethrough" />
        </MemoButton>
        <MemoButton tooltip="Code" tooltipShortcut={['Mod', 'E']} onClick={commands.onCode} active={states.isCode}>
          <Icon name="Code" />
        </MemoButton>


        {/* text color */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton active={!!states.currentColor} tooltip="Text color">
              <Icon name="Palette" />
            </MemoButton>
          </Popover.Trigger>
          <Popover.Content side="top" sideOffset={8} asChild>
            <Surface className="p-1">
              <MemoColorPicker
                color={states.currentColor}
                onChange={commands.onChangeColor}
                onClear={commands.onClearColor}
              />
            </Surface>
          </Popover.Content>
        </Popover.Root>

        {/* text highlight */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton active={!!states.currentHighlight} tooltip="Highlight text">
              <Icon name="Highlighter" />
            </MemoButton>
          </Popover.Trigger>
          <Popover.Content side="top" sideOffset={8} asChild>
            <Surface className="p-1">
              <MemoColorPicker
                color={states.currentHighlight}
                onChange={commands.onChangeHighlight}
                onClear={commands.onClearHighlight}
              />
            </Surface>
          </Popover.Content>
        </Popover.Root>

        {/* comments */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <MemoButton active={false} tooltip="Commenter">
              <div className="flex relative">
                <Icon name="MessageSquareText" />
                {/* {currentMessage && <span className="absolute -top-4 -right-4 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{JSON.parse(currentMessage.attrs.comment).comments.length}</span>} */}
              </div>
            </MemoButton>
          </Popover.Trigger>
          <Popover.Content side="top" sideOffset={8} asChild>
            <Surface className="p-1 max-w-[30rem]">
              <CommentView editor={editor} />
            </Surface>
          </Popover.Content>
        </Popover.Root>

      </Toolbar.Wrapper>

    </BubbleMenu>
  )
}
