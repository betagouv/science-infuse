import React, { useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import Box from '@mui/material/Box';
import { Icon } from '@/course_editor/components/ui/Icon';
import { Toolbar } from '@/course_editor/components/ui/Toolbar';

interface AllowShareProps {
  onChange: (isAllowed: boolean) => void;
  value: boolean;
}

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  transition: theme.transitions.create(['color'], {
    duration: theme.transitions.duration.shortest,
  }),
}));

const AllowShare: React.FC<AllowShareProps> = ({ onChange, value }) => {
  const handleClick = useCallback(() => {
    onChange(!value);
  }, [onChange, value]);

  return (
    <Box display="flex" alignItems="center">
      <Toolbar.Button
        tooltip={value ? "Contenu partagé" : "Contenu non partagé"}
        active={false}
        onClick={handleClick}
      >
        <Icon  name={value == true ? "Eye" : "Lock"} />
      </Toolbar.Button>

    </Box>
  );
};

export default React.memo(AllowShare);