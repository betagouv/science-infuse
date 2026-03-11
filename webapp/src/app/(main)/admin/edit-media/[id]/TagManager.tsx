'use client';

import { useState } from 'react';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { DocumentTag } from '@prisma/client';

interface TagManagerProps {
    selectedTags: DocumentTag[];
    allTags: DocumentTag[];
    onTagsChange: (tags: DocumentTag[]) => void;
}

export default function TagManager({ selectedTags, allTags, onTagsChange }: TagManagerProps) {
    const [newTagInput, setNewTagInput] = useState('');
    const [availableTags, setAvailableTags] = useState<DocumentTag[]>(
        allTags.filter(tag => !selectedTags.some(selected => selected.id === tag.id))
    );

    const handleAddTag = (tag: DocumentTag) => {
        const newSelectedTags = [...selectedTags, tag];
        onTagsChange(newSelectedTags);
        setAvailableTags(prev => prev.filter(t => t.id !== tag.id));
    };

    const handleRemoveTag = (tagToRemove: DocumentTag) => {
        const newSelectedTags = selectedTags.filter(tag => tag.id !== tagToRemove.id);
        onTagsChange(newSelectedTags);
        setAvailableTags(prev => [...prev, tagToRemove].sort((a, b) => a.title.localeCompare(b.title)));
    };

    const handleCreateNewTag = async () => {
        if (!newTagInput.trim()) return;

        const tagTitle = newTagInput.trim().toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_');
        
        // Check if tag already exists
        const existingTag = allTags.find(tag => tag.title === tagTitle);
        if (existingTag) {
            handleAddTag(existingTag);
            setNewTagInput('');
            return;
        }

        try {
            // Create new tag via API
            const response = await fetch('/api/document-tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: tagTitle,
                    description: `Tag créé automatiquement: ${tagTitle}`
                }),
            });

            if (response.ok) {
                const newTag = await response.json();
                const newSelectedTags = [...selectedTags, newTag];
                onTagsChange(newSelectedTags);
                setNewTagInput('');
            } else {
                console.error('Failed to create tag');
                alert('Erreur lors de la création du tag');
            }
        } catch (error) {
            console.error('Error creating tag:', error);
            alert('Erreur lors de la création du tag');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCreateNewTag();
        }
    };

    return (
        <div className="space-y-4">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags sélectionnés</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                            <span
                                key={tag.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                            >
                                {tag.title}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Add New Tag Input */}
            <div className="flex gap-2">
                <Input
                    label="Ajouter un tag"
                    nativeInputProps={{
                        value: newTagInput,
                        onChange: (e) => setNewTagInput(e.target.value),
                        onKeyPress: handleKeyPress,
                        placeholder: "Saisir un nouveau tag..."
                    }}
                    className="flex-1"
                />
                <Button
                    type="button"
                    iconId="fr-icon-add-line"
                    onClick={handleCreateNewTag}
                    disabled={!newTagInput.trim()}
                    className="self-end"
                >
                    Ajouter
                </Button>
            </div>

            {/* Available Tags */}
            {availableTags.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags disponibles</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleAddTag(tag)}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                {tag.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
