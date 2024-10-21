'use client';

import { apiClient } from '@/lib/api-client';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import { Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { DataGrid, GridColDef, GridRowModel, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Chapter, ChapterStatus, EducationLevel } from '@prisma/client';
import { QueryFunction, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import AdminWrapper from '../AdminWrapper';
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { useSearchParams } from 'next/navigation';

const fetchCourses: QueryFunction<Chapter[], [string]> = async ({ queryKey }) => {
    const toc = await apiClient.getChaptersByTheme("all");
    return toc;
};

const AdminChapters = () => {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const quickFilterValue = searchParams.get('q')
    const { data: chapters, isLoading: chapterLoading, error: chaptersError } = useQuery({
        queryKey: ['chapters'],
        queryFn: fetchCourses
    })

    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<ChapterStatus | null>(null);

    const updateChapterMutation = useMutation({
        mutationFn: (chapter: Chapter) => {
            const { content, ..._chapter } = chapter;
            return apiClient.updateChapter(chapter.id, _chapter);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chapters'] });
        },
    });

    if (chapterLoading) return <div className="w-full h-full flex items-center justify-center py-64">
        <CircularProgress />
    </div>
    if (chaptersError) return <p>Error fetching data</p>

    const columns: GridColDef[] = [
        { flex: 1, field: 'title', headerName: 'Titre', minWidth: 450, editable: true, renderCell: (params) => params.row.title && <a target='_blank' href={`/prof/chapitres/${params.row.id}`}>{params.row.title}</a> },
        {
            field: 'status',
            headerName: 'Statut',
            editable: false,
            minWidth: 200,
            sortComparator: (v1, v2) => {
                const order = [ChapterStatus.REVIEW, ChapterStatus.DRAFT, ChapterStatus.PUBLISHED, ChapterStatus.DELETED]
                return order.indexOf(v1) - order.indexOf(v2)
            },
            renderCell: (params) => {
                const state = params.value as ChapterStatus;
                const color = {
                    [ChapterStatus.DRAFT]: 'info',
                    [ChapterStatus.REVIEW]: 'new',
                    [ChapterStatus.PUBLISHED]: 'success',
                    [ChapterStatus.DELETED]: 'error',
                }[state] as 'new' | 'error' | 'success' | 'warning' | 'info';
                return <div className='flex h-full items-center justify-between'>
                    <Badge noIcon severity={color} key={params.value} style={{ margin: '2px' }}>{params.value}</Badge>
                    <Button onClick={() => handleOpenRolesDialog(params.row)}>Modifier</Button>
                </div>
            }
        },
        { flex: 0, field: 'user', headerName: 'Auteur', width: 240, renderCell: (params) => params.row.user && <a target='_blank' href={`/admin/utilisateurs?q=${params.row.user.id}`}>{params.row.user.email}</a> },
        {
            field: 'educationLevels',
            headerName: 'Niveaux d\'éducation',
            editable: false,
            minWidth: 200,
            renderCell: (params) => (
                <div className='block'>
                    {params.value
                        .sort((a: EducationLevel, b: EducationLevel) => a.name.localeCompare(b.name))
                        .map((el: EducationLevel) => (
                            <Chip key={el.id} label={el.name} style={{ margin: '2px' }} />
                        ))}
                </div>
            )
        },
        { flex: 1, field: 'id', headerName: 'Id', minWidth: 300, editable: true},
        
    ];

    const handleOpenRolesDialog = (chapter: Chapter) => {
        setSelectedChapter(chapter);
        setSelectedStatus(chapter.status);
        setOpenStatusDialog(true);
    };

    const handleCloseRolesDialog = () => {
        setOpenStatusDialog(false);
        setSelectedChapter(null);
        setSelectedStatus(null);
    };

    const handleSaveStatus = () => {
        if (selectedChapter && selectedStatus) {
            const updatedChapter: Chapter = { ...selectedChapter, status: selectedStatus };
            updateChapterMutation.mutate(updatedChapter);
            handleCloseRolesDialog();
        }
    };

    const handleRoleChange = (status: ChapterStatus) => {
        setSelectedStatus(status);
    };

    const handleRowUpdate = (newRow: GridRowModel) => {
        updateChapterMutation.mutate(newRow as Chapter);
        return newRow;
    };

    return (
        <AdminWrapper>
            <DataGrid
                style={{ height: "90vh" }}
                rows={chapters || []}
                columns={columns}
                editMode="row"
                processRowUpdate={handleRowUpdate}
                slots={{
                    toolbar: () => (
                        <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <GridToolbarQuickFilter
                                placeholder='Rechercher'
                            />
                        </div>
                    ),
                }}
                initialState={{
                    filter: {
                        filterModel: {
                            items: [],
                            quickFilterValues: [quickFilterValue],
                        },
                    },
                }}
            />

            <Dialog open={openStatusDialog} onClose={handleCloseRolesDialog}>
                <DialogTitle>Modifier les rôles</DialogTitle>
                <DialogContent>
                    <RadioButtons
                        legend="Sélectionnez un statut"
                        name="chapter-status"
                        options={Object.values(ChapterStatus).map(status => ({
                            label: status,
                            nativeInputProps: {
                                value: status,
                                checked: selectedStatus === status,
                                onChange: () => handleRoleChange(status)
                            }
                        }))}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRolesDialog}>Annuler</Button>
                    <Button onClick={handleSaveStatus}>Enregistrer</Button>
                </DialogActions>
            </Dialog>
        </AdminWrapper>
    )
}

export default AdminChapters;
