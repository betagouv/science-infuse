import * as React from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Skill } from '@prisma/client';

interface SkillsPickerProps {
    className?: string;
    selectedSkills: Skill[];
    onSelectedSkills: (newSkills: Skill[]) => void;
}

export default function SkillsPicker({ className, selectedSkills, onSelectedSkills }: SkillsPickerProps) {
    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        const fetchSkills = async () => {
            const _skills = await apiClient.getSkills();
            setSkills(_skills);
        };
        fetchSkills();
    }, []);

    return (
        <Autocomplete
            multiple
            className={`w-full ${className || ''}`}
            id="skills"
            // use key idea from DB by comparing id instead of just using the raw stored in attributes of courseBlock.
            value={skills.filter(ki => selectedSkills.find(ski => ski.id === ki.id))}
            onChange={(event, newValue) => {
                onSelectedSkills(newValue);
            }}
            options={skills}
            getOptionLabel={(option) => option.title}
            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                        <Chip
                            key={key}
                            label={option.title}
                            {...tagProps}
                        />
                    );
                })
            }
            renderInput={(params) => (
                <TextField {...params} label="Compétences" placeholder="Compétences" />
            )}
        />
    );
}