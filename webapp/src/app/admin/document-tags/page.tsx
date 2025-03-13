'use client';

import { createDocumentTag, deleteDocumentTag, getAllDocumentTags, updateDocumentTag } from "@/lib/utils/db";
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, GridRowId, GridRowModel, GridToolbarQuickFilter } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import AdminWrapper from '../AdminWrapper';

interface DocumentTag {
    id: string;
    title: string;
    description: string;
    _count?: { documents: number };
}

const DocumentTagsManager: React.FC = () => {
    const [tags, setTags] = useState<DocumentTag[]>([]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newTag, setNewTag] = useState<Partial<DocumentTag>>({
        title: '',
        description: ''
    });

    // Fetch tags on component mount
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const fetchedTags = await getAllDocumentTags();
                setTags(fetchedTags);
            } catch (error) {
                console.error('Failed to fetch tags', error);
            }
        };
        fetchTags();
    }, []);

    // Handle adding a new tag
    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
        setNewTag({ title: '', description: '' });
    };

    const handleAddTag = async () => {
        if (!newTag.title || !newTag.description) {
            alert('Title and description are required');
            return;
        }

        try {
            const createdTag = await createDocumentTag({
                title: newTag.title,
                description: newTag.description
            });
            setTags([...tags, createdTag]);
            handleCloseAddDialog();
        } catch (error) {
            console.error('Failed to create tag', error);
            alert('Failed to create tag');
        }
    };

    const processRowUpdate = async (newRow: GridRowModel) => {
        try {
            const updatedTag = await updateDocumentTag(newRow.id, {
                title: newRow.title,
                description: newRow.description
            });

            // Update local state
            setTags(tags.map(tag =>
                tag.id === newRow.id
                    ? { ...updatedTag, _count: tag._count }
                    : tag
            ));

            return newRow;
        } catch (error) {
            console.error('Failed to update tag', error);
            throw error;
        }
    };

    // Handle row delete
    const handleDeleteClick = (id: GridRowId) => async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce Tag ?')) {
            try {
                await deleteDocumentTag(id as string);
                setTags(tags.filter(tag => tag.id !== id));
            } catch (error) {
                console.error('Échec de la suppression du tag.', error);
                alert('Échec de la suppression du tag.');
            }
        }
    };

    // Column definitions
    const columns: GridColDef[] = [
        {
            field: 'title',
            headerName: 'Title',
            width: 200,
            editable: true
        },
        {
            field: 'description',
            headerName: 'Description',
            width: 300,
            editable: true
        },
        {
            field: 'documentCount',
            headerName: 'Documents',
            width: 150,
            valueGetter: (value, row) => row._count?.documents || 0
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                return [
                    <GridActionsCellItem
                        key={id}
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="error"
                    />
                ];
            },
        },
    ];

    return (
        <AdminWrapper>
            <div className='flex flex-col p-4'>
                <h1 className='mb-4'>Document Tags Manager</h1>

                <div style={{ height: 500, width: '100%' }}>
                    <DataGrid
                        rows={tags}
                        columns={columns}
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={(error) => {
                            console.error('Row update error:', error);
                        }}
                        slots={{
                            toolbar: () => (
                                <div className='flex justify-between p-2'>
                                    <GridToolbarQuickFilter />
                                    <div>
                                        <Button
                                            startIcon={<AddIcon />}
                                            onClick={handleOpenAddDialog}
                                        >
                                            Ajouter un Tag de document
                                        </Button>
                                    </div>
                                </div>
                            ),
                        }}
                        editMode="row"
                    />
                </div>

                <Dialog
                    open={isAddDialogOpen}
                    onClose={handleCloseAddDialog}
                >
                    <DialogTitle>Ajouter un nouveau Tag de document</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Titre"
                            fullWidth
                            value={(newTag.title || "").toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_')}
                            onChange={(e) => setNewTag({
                                ...newTag,
                                title: e.target.value.toUpperCase().replace(/\s+/g, '_').replace(/-/g, '_')
                            })}
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            value={newTag.description}
                            onChange={(e) => setNewTag({
                                ...newTag,
                                description: e.target.value
                            })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseAddDialog}>Cancel</Button>
                        <Button onClick={handleAddTag}>Add</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </AdminWrapper>
    );
};

export default DocumentTagsManager;