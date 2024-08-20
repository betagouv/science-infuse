import * as React from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { EducationLevel } from '@prisma/client';
import { Checkbox } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface EducationLevelPickerProps {
    className?: string;
    selectedEducationLevels: EducationLevel[];
    onSelectedEducationLevels: (newEducationLevels: EducationLevel[]) => void;
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export default function EducationLevelPicker({ className, selectedEducationLevels, onSelectedEducationLevels }: EducationLevelPickerProps) {
    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);

    useEffect(() => {
        const fetchEducationLevels = async () => {
            const _EducationLevels = await apiClient.getEducationLevels();
            setEducationLevels(_EducationLevels);
        };
        fetchEducationLevels();
    }, []);

    return (
        <Autocomplete
            multiple
            className={`w-full ${className || ''}`}
            id="checkboxes-tags-demo"
            options={educationLevels}
            disableCloseOnSelect
            value={educationLevels.filter(el => selectedEducationLevels.find(sel => sel.id === el.id))}
            onChange={(event, newValue) => {
                onSelectedEducationLevels(newValue);
            }}
            getOptionLabel={(option) => option.name}
            renderOption={(props, option, { selected }) => {
                const { key, ...optionProps } = props;
                return (
                    <li key={key} {...optionProps}>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{ marginRight: 8 }}
                            checked={selected}
                        />
                        {option.name}
                    </li>
                );
            }}
            renderInput={(params) => (
                <TextField {...params} label="Niveau éducatif" placeholder="6ème" />
            )}
        />
    );
}