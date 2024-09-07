'use client';

import { BubbleMenu as BaseBubbleMenu, Editor } from '@tiptap/react'
import React, { memo, useCallback, useRef } from 'react'
import { Instance, sticky } from 'tippy.js'
import { Toolbar } from '@/course_editor/components/ui/Toolbar'
import { Icon } from '@/course_editor/components/ui/Icon'
import { useEffect, useState } from '@preact-signals/safe-react/react';
import { apiClient } from '@/lib/api-client';
import { Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { ImageBlockWidth } from '../ImageBlock/components/ImageBlockWidth';
import AllowShare from './AllowShare';
import { ImageBlock } from '../ImageBlock';
import PdfBlock from '../PdfBlock/PdfBlock';
import getRenderContainer from '@/lib/utils/getRenderContainer';
import FileTypePicker from './FileTypePicker';
import VideoSearch from '../VideoSearch';
import Input from '@codegouvfr/react-dsfr/Input';

const ImageOptions = (props: { editor: Editor }) => {
  const { editor } = props;
  const onAlignImageLeft = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('left').run()
  }, [editor])

  const onAlignImageCenter = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('center').run()
  }, [editor])

  const onAlignImageRight = useCallback(() => {
    editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockAlign('right').run()
  }, [editor])

  const onWidthChange = useCallback(
    (value: number) => {
      editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockWidth(value).run()
    },
    [editor],
  )

  return <>
    <Toolbar.Button
      tooltip="Aligner l'image à gauche"
      active={editor.isActive('imageBlock', { align: 'left' })}
      onClick={onAlignImageLeft}
    >
      <Icon name="AlignHorizontalDistributeStart" />
    </Toolbar.Button>
    <Toolbar.Button
      tooltip="Aligner l'image au centre"
      active={editor.isActive('imageBlock', { align: 'center' })}
      onClick={onAlignImageCenter}
    >
      <Icon name="AlignHorizontalDistributeCenter" />
    </Toolbar.Button>
    <Toolbar.Button
      tooltip="Aligner l'image à droite"
      active={editor.isActive('imageBlock', { align: 'right' })}
      onClick={onAlignImageRight}
    >
      <Icon name="AlignHorizontalDistributeEnd" />
    </Toolbar.Button>
    <Toolbar.Divider />
    <ImageBlockWidth onChange={onWidthChange} value={parseInt(editor.getAttributes('imageBlock').width)} />
  </>
}


const DeleteOption = (props: { editor: Editor }) => {
  const { editor } = props;
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const onDelete = useCallback(() => {
    editor.chain().deleteSelection().run();
  }, [editor]);

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirmDelete = () => {
    onDelete();
    handleCloseConfirmDialog();
  };

  return (
    <>
      <Toolbar.Button
        tooltip="Supprimer"
        active={true}
        onClick={handleOpenConfirmDialog}
      >
        <Icon className='text-red-600' name="Trash2" />
      </Toolbar.Button>
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer cet élément ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Annuler</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const FileSourceOption = (props: { editor: Editor; onSubmit: (source: string) => void }) => {
  const { editor } = props;
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const selectedNodeAttrs = editor?.state?.selection?.node?.attrs;
  const originalSource = selectedNodeAttrs?.fileSource || "";
  const fileSource = selectedNodeAttrs?.fileSource;


  const [source, setSource] = useState(originalSource)

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleConfirmSource = () => {
    props.onSubmit(source);
    handleCloseConfirmDialog();
  };

  return (
    <>
      <Toolbar.Button
        tooltip="Sources"
        active={false}
        onClick={handleOpenConfirmDialog}
      >
        <Icon className={fileSource ? '' : 'text-red-600'} name="Quote" />
      </Toolbar.Button>
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Source du document
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Veuillez indiquer les sources du document.
            <Input
              nativeTextAreaProps={{
                value: source,
                onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setSource(e.target.value),
                required: true,
                placeholder: "Sources",
              }}
              label="Sources"
              textArea
            />
          </DialogContentText>

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Annuler</Button>
          <Button onClick={handleConfirmSource} autoFocus>Confirmer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export const FileBubbleMenu = ({ editor, appendTo }: any): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null)
  const tippyInstance = useRef<Instance | null>(null)



  const selectedNodeAttrs = editor?.state?.selection?.node?.attrs;
  const s3ObjectName = selectedNodeAttrs?.s3ObjectName;
  const fileTypes = selectedNodeAttrs?.fileTypes;
  const shared = selectedNodeAttrs?.shared;
  const nodeName = editor?.state?.selection?.node?.type?.name;


  const getReferenceClientRect = useCallback(() => {
    const renderContainer = getRenderContainer(editor, 'node-imageBlock')
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0)

    return rect
  }, [editor])
  return (
    <>
      <BaseBubbleMenu
        editor={editor}
        pluginKey={`imageBlockMenu`}
        updateDelay={100}
        tippyOptions={{
          maxWidth: '100%',
          zIndex: 99,
          offset: [0, -50],
          popperOptions: {
            modifiers: [{ name: 'flip', enabled: false }],
          },
          // getReferenceClientRect,
          onCreate: (instance: Instance) => {
            tippyInstance.current = instance
          },
          appendTo: () => {
            return appendTo?.current
          },
          plugins: [sticky],
          sticky: 'popper',
        }}
      >
        <Toolbar.Wrapper shouldShowContent={[ImageBlock.name, VideoSearch.name, PdfBlock.name].includes(nodeName)} ref={menuRef}>



          {nodeName == ImageBlock.name && <ImageOptions editor={editor} />}

          {!!s3ObjectName && <FileSourceOption onSubmit={(newSource: string) => {
            editor.chain().focus(undefined, { scrollIntoView: false }).setFileSource(newSource).run()
          }} editor={editor} />
          }


          {!!s3ObjectName && <AllowShare
            value={shared}
            onChange={async function (isAllowed: boolean): Promise<void> {
              editor.chain().focus(undefined, { scrollIntoView: false }).setFileShared(isAllowed).run()
            }}
          />}



          {!!s3ObjectName && <FileTypePicker
            onChange={function (type: string): void {
              editor.chain().focus(undefined, { scrollIntoView: false }).setFileTypes([type]).run()
            }}
            value={fileTypes.length > 0 ? fileTypes[0] : undefined}
          />}


          <Toolbar.Divider />

          <DeleteOption editor={editor} />

        </Toolbar.Wrapper>
      </BaseBubbleMenu>
    </>
  )
}

export default FileBubbleMenu