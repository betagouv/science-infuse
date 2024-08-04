import React, { useCallback } from 'react';
import { styled } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import Box from '@mui/material/Box';
import { Icon } from '@/course_editor/components/ui/Icon';

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
    <Box display="flex" marginLeft={4} alignItems="center">
      <Tooltip
        title={value ? "Contenu partagé" : "Contenu non partagé"}
        placement="top"
      >
        <StyledIconButton onClick={handleClick} size="small">
          <Icon name={value == true ? "Eye" : "Lock"} />

          {/* {value ? <VisibilityIcon fontSize="small" /> : <LockIcon fontSize="small" />} */}
        </StyledIconButton>
      </Tooltip>
    </Box>
  );
};

export default React.memo(AllowShare);