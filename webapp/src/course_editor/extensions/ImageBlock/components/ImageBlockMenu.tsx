'use client';

import { BubbleMenu as BaseBubbleMenu } from '@tiptap/react'
import React, { memo, useCallback, useRef } from 'react'
import { Instance, sticky } from 'tippy.js'
import { Toolbar } from '@/course_editor/components/ui/Toolbar'
import { Icon } from '@/course_editor/components/ui/Icon'
import { ImageBlockWidth } from './ImageBlockWidth'
import { getRenderContainer } from '../../../../lib/utils/getRenderContainer'
import { useEffect, useState } from '@preact-signals/safe-react/react';
import AllowShare from '../../BubbleMenu/AllowShare';
import { apiClient } from '@/lib/api-client';
import { Snackbar, Alert } from '@mui/material';

export const ImageBlockMenu = ({ editor, appendTo }: any): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null)
  const tippyInstance = useRef<Instance | null>(null)
  const [shared, setShared] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });


  const getReferenceClientRect = useCallback(() => {
    const renderContainer = getRenderContainer(editor, 'node-imageBlock')
    const rect = renderContainer?.getBoundingClientRect() || new DOMRect(-1000, -1000, 0, 0)
    return rect
  }, [editor])

  const shouldShow = useCallback(() => {
    return true;
  }, [editor])

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

  const selectedNodeAttrs = editor?.state?.selection?.node?.attrs;
  const s3ObjectName = selectedNodeAttrs?.s3ObjectName;
  console.log("editor?.state", s3ObjectName)

  useEffect(() => {
    (async () => {
      if (s3ObjectName) {
        const isShared = await apiClient.isImageShared(s3ObjectName)
        setShared(isShared)
      }
    })()
  }, [s3ObjectName])


  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <BaseBubbleMenu
        editor={editor}
        pluginKey={`imageBlockMenu`}
        updateDelay={100}
        tippyOptions={{
          offset: [0, 8],
          popperOptions: {
            modifiers: [{ name: 'flip', enabled: false }],
          },
          getReferenceClientRect,
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
        <Toolbar.Wrapper shouldShowContent={shouldShow()} ref={menuRef}>
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
          {!!s3ObjectName && <AllowShare
            value={shared}
            onChange={async function (isAllowed: boolean): Promise<void> {
              setShared(isAllowed);
              editor.chain().focus(undefined, { scrollIntoView: false }).setImageBlockShared(isAllowed).run()
              const selectedNodeAttrs = editor?.state?.selection?.node?.attrs;
              const s3ObjectName = selectedNodeAttrs?.s3ObjectName;
              console.log("SELSCTED NODE", s3ObjectName)

              if (!s3ObjectName) {
                return setSnackbar({
                  open: true,
                  message: 'Impossible de trouver s3ObjectName.',
                  severity: 'error'
                });
              }
              try {
                const response = await apiClient.shareImage(s3ObjectName, isAllowed);
                setSnackbar({
                  open: true,
                  message: 'Statut de partage de l\'image mis à jour avec succès',
                  severity: 'success'
                });
              } catch (error) {
                setSnackbar({
                  open: true,
                  message: 'Échec de la mise à jour du statut de partage de l\'image',
                  severity: 'error'
                });
              }
            }}
          />}
        </Toolbar.Wrapper>
      </BaseBubbleMenu>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ImageBlockMenu