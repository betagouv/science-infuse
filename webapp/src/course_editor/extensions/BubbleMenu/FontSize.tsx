import React, { useState, useCallback, useRef } from 'react';
import Button from '@mui/material/Button';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Grow from '@mui/material/Grow';

interface FontSizePickerProps {
  onChange: (size: string) => void;
  value: string | undefined;
}

const FontSizePicker: React.FC<FontSizePickerProps> = ({ onChange, value }) => {
  const [open, setOpen] = useState<boolean>(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

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
        onClick={handleToggle}
        endIcon={<KeyboardArrowDownIcon />}
      >
        {value || 'Font Size'}
      </Button>
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
                  {['Small', 'Medium', 'Large'].map((size) => (
                    <MenuItem key={size} onClick={handleMenuItemClick(size)}>
                      {size}
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

export default React.memo(FontSizePicker);