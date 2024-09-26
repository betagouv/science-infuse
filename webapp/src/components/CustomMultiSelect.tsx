import React from 'react';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import MUISelect, { SelectChangeEvent } from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import styled from "@emotion/styled";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const StyledMultiSelect = styled.div`
  fieldset {
    border: none;
  }
  .Mui-focusVisible {
    background-color: inherit !important;
  }

  .MuiSelect-nativeInput {
    display: none !important;
  }

  .si-select {
    padding: 0.5rem 1rem !important;
    &>.MuiSelect-select {
      padding: 0!important;
    }
  }


  svg.MuiSelect-icon {
    display: none;
  }
`;

interface CustomMultiSelectProps {
  value: string[];
  required?: boolean;
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  label: string;
  disabled?: boolean;
}

const CustomMultiSelect: React.FC<CustomMultiSelectProps> = ({ value, required, onChange, options, label, disabled }) => {
  const handleChange = (event: SelectChangeEvent<typeof value>) => {
    const {
      target: { value: selectedValue },
    } = event;
    onChange(typeof selectedValue === 'string' ? selectedValue.split(',') : selectedValue);
  };

  return (
    <StyledMultiSelect className={`fr-input-group m-0 ${disabled ? 'fr-select-group--disabled' : ''}`}>
      <FormControl variant="standard" className="w-full">
        <label className="fr-label" htmlFor={`multi-select-${label}`}>{label}</label>
        <MUISelect
          required={required}
          className="fr-input si-select fr-select"
          disableUnderline={true}
          style={{
            display: 'block',
            width: '100%',
            borderRadius: '0.25rem 0.25rem 0 0',
            fontSize: '1rem',
            lineHeight: '1.5rem',
            padding: '0.5rem 1rem',
            boxShadow: disabled ? 'inset 0 -2px 0 0 var(--border-disabled-grey) !important' : undefined,

          }}
          multiple
          value={value}
          onChange={handleChange}
          input={<OutlinedInput className="fr-input" />}
          renderValue={(selected) => selected.map(v => options.find(o => o.value === v)?.label || "").join(', ')}
          MenuProps={MenuProps}
          disabled={disabled}
          id={`multi-select-${label}`}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              <Checkbox checked={value.indexOf(option.value) > -1} />
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </MUISelect>
      </FormControl>
    </StyledMultiSelect >
  );
};

export default CustomMultiSelect;