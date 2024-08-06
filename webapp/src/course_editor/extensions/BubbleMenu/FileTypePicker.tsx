import React, { useState, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Grow from '@mui/material/Grow';
import { FileType } from '@prisma/client';
import { useEffect } from '@preact-signals/safe-react/react';
import { apiClient } from '@/lib/api-client';

interface FileTypePickerProps {
  onChange: (size: string) => void;
  value: string | undefined;
}

const FileTypePicker: React.FC<FileTypePickerProps> = ({ onChange, value }) => {
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);

  useEffect(() => {
    apiClient.getFileTypes().then((ft) => setFileTypes(ft))
    console.log("GET FILE TYPES")
  }, [])

  const handleToggle = useCallback(() => {
    setOpen((prevOpen) => !prevOpen);
  }, []);

  const handleClose = useCallback((event: MouseEvent | TouchEvent) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }
    setOpen(false);
  }, []);

  const handleMenuItemClick = useCallback((size: string) => (event: React.MouseEvent<HTMLLIElement>) => {
    onChange(size);
    setOpen(false);
  }, [onChange]);



  return (
    <>
      <Button
        ref={anchorRef}
        // className='w-48'
        onClick={handleToggle}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {fileTypes.find(type => type.id === value)?.name || 'Type de fichier'}      </Button>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ? 'left top' : 'left bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow">
                  {fileTypes.map((ft) => (
                    <MenuItem key={ft.id} onClick={handleMenuItemClick(ft.id)}>
                      {ft.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default React.memo(FileTypePicker);