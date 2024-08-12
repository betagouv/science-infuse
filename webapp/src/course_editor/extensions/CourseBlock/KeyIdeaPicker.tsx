import * as React from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { KeyIdea } from '@prisma/client';

interface KeyIdeasPickerProps {
    className?: string;
    selectedKeyIdeas: KeyIdea[];
    onSelectedKeyIdeas: (newKeyIdeas: KeyIdea[]) => void;
}

export default function KeyIdeasPicker({ className, selectedKeyIdeas, onSelectedKeyIdeas }: KeyIdeasPickerProps) {
    const [keyIdeas, setKeyIdeas] = useState<KeyIdea[]>([]);

    useEffect(() => {
        const fetchKeyIdeas = async () => {
            const _keyIdeas = await apiClient.getKeyIdeas();
            setKeyIdeas(_keyIdeas);
        };
        fetchKeyIdeas();
    }, []);

    return (
        <Autocomplete
            multiple
            className={`w-full ${className || ''}`}
            id="keyIdeas"
            // use key idea from DB by comparing id instead of just using the raw stored in attributes of courseBlock.
            value={keyIdeas.filter(ki => selectedKeyIdeas.find(ski => ski.id === ki.id))}
            onChange={(event, newValue) => {
                onSelectedKeyIdeas(newValue);
            }}
            options={keyIdeas}
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
                <TextField {...params} label="Idée-clé" placeholder="Idée-clé" />
            )}
        />
    );
}