import * as React from 'react';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { KeyIdea } from '@prisma/client';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CircularProgress from '@mui/material/CircularProgress';
import { Tooltip } from '@mui/material';
import { flushSync } from 'react-dom';

interface KeyIdeasPickerProps {
    className?: string;
    getContext?: () => string;
    selectedKeyIdeas: KeyIdea[];
    onSelectedKeyIdeas: (newKeyIdeas: KeyIdea[]) => void;
}

export default function KeyIdeasPicker({ className, getContext, selectedKeyIdeas, onSelectedKeyIdeas }: KeyIdeasPickerProps) {
    const [keyIdeas, setKeyIdeas] = useState<KeyIdea[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        const fetchKeyIdeas = async () => {
            const _keyIdeas = await apiClient.getKeyIdeas();
            setKeyIdeas(_keyIdeas);
        };
        fetchKeyIdeas();
    }, []);

    const generateAIKeyIdeas = async () => {
        if (!getContext) return;
        const context = getContext();
        setIsAiLoading(true);

        try {
            // Call a fake AI route
            const response = await apiClient.getKeyIdeaAiReco(context);
            const firstScore = response[0]?.score || 0;
            const threshold = firstScore * 0.6;
            const newKeyIdeas = response
                .filter(item => item.score >= threshold)
                .map(item => item.text);

            if (newKeyIdeas.length > 0) {
                onSelectedKeyIdeas([...keyIdeas.filter(ki => newKeyIdeas.includes(ki.title))]);
            }
        } catch (error) {
            console.error('Error fetching AI key idea:', error);
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <div className={`w-full ${className || ''} flex items-center gap-4`}>
            <Autocomplete
                multiple
                className="w-[calc(100%-4rem)] flex-grow"
                id="keyIdeas"
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
                            <Tooltip
                                enterDelay={500}
                                key={`${option.title}${index}`}
                                title={option.title}>
                                <Chip
                                    label={option.title}
                                    {...tagProps}
                                />
                            </Tooltip>
                        );
                    })
                }
                renderInput={(params) => (
                    <TextField {...params} label="Idée-clé" placeholder="Idée-clé" />
                )}
            />
            <Tooltip
                enterDelay={500}
                title={"Générer automatiquement"}>
                <Button
                    variant="text"
                    className="h-[56px] w-[56px] min-w-[56px] p-0 ml-2"
                    color="primary"
                    onClick={generateAIKeyIdeas}
                    disabled={isAiLoading}
                >
                    {isAiLoading ? <CircularProgress size={24} /> : <AutoAwesomeIcon />}
                </Button>
            </Tooltip>
        </div>
    );
}