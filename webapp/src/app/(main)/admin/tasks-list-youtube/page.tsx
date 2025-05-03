'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { apiClient } from '@/lib/api-client';
import { Chip, CircularProgress, Tooltip } from '@mui/material';
import AdminWrapper from '../AdminWrapper';
import { PgBossJobGetIndexContentResponse } from '@/types/queueing';
import { extractYoutubeVideoId } from '@/lib/utils/youtube';

const columns: GridColDef[] = [
    // { field: 'id', headerName: 'ID', width: 100 },
    //   { field: 'name', headerName: 'Name', width: 150 },
    {
        field: 'url',
        headerName: 'Vidéo', width: 200,
        valueGetter: (value, row) => row.data.url,
        renderCell: (params) => <a href={params.value} target="_blank">{extractYoutubeVideoId(params.value)}</a>
    },
    {
        field: 'document',
        headerName: 'Document', width: 200,
        valueGetter: (value, row) => row.data.url,
        renderCell: (params) => <a href={params.value} target="_blank">{JSON.stringify(params.value)}</a>
    },
    {
        field: 'state',
        headerName: 'Etat',
        width: 120,
        renderCell: (params) => {
            const state = params.value as 'created' | 'retry' | 'active' | 'completed' | 'cancelled' | 'failed';
            const color = {
                created: 'default',
                retry: 'warning',
                active: 'info',
                completed: 'success',
                cancelled: 'error',
                failed: 'error'
            }[state] as 'default' | 'warning' | 'info' | 'success' | 'error';
            return <Chip label={state} color={color} size="small" />;
        }
    },
    { field: 'author', headerName: 'Source', width: 150, valueGetter: (value, row) => row.data?.author },
    { field: 'started_on', headerName: 'Démarré le', width: 170, valueFormatter: (value, row) => value ? new Date(value).toLocaleString('fr-FR') : 'N/A' },
    // { field: 'created_on', headerName: 'Créé le', width: 170, valueFormatter: (value, row) => value ? new Date(value).toLocaleString('fr-FR') : 'N/A' },
    // { field: 'completed_on', headerName: 'Terminé le', width: 170, valueFormatter: (value, row) => value ? new Date(value).toLocaleString('fr-FR') : 'N/A' },
    {
        field: 'timeTaken',
        headerName: 'Temps écoulé',
        width: 150,
        valueGetter: (value, row) => {
            const started = row.started_on;
            const completed = row.completed_on;
            if (started && completed) {
                const timeDiff = new Date(completed).getTime() - new Date(started).getTime();
                return `${Math.floor(timeDiff / 60000)} min ${Math.floor((timeDiff % 60000) / 1000)} sec`;
            }
            return 'N/A';
        },
    },
    { field: 'message', headerName: 'Message', width: 200, valueGetter: (value, row) => row.output?.message },
]; const JobList: React.FC = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const { data, isLoading, isError } = useQuery<PgBossJobGetIndexContentResponse>({
        queryKey: ['data.auto-index-youtube', paginationModel.page, paginationModel.pageSize],
        queryFn: () => apiClient.fetcheIndexFileJobs(paginationModel.page + 1, paginationModel.pageSize, 'data.auto-index-youtube'),
        refetchInterval: 10000,
    });

    const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
        setPaginationModel(newPaginationModel);
    };

    if (isLoading) return <div className="w-full h-full flex items-center justify-center py-64">
        <CircularProgress />
    </div>;
    if (isError) return <div>Error fetching jobs</div>;

    return (
        <AdminWrapper>
            <div className='flex flex-col'>
                <h1>Liste des tâches</h1>
                <DataGrid
                    style={{ minHeight: "90vh" }}
                    rows={data?.jobs || []}
                    columns={columns}
                    paginationMode="server"
                    pageSizeOptions={[10, 25, 50, 100]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={handlePaginationModelChange}
                    rowCount={data?.pagination.totalCount || 0}
                    loading={isLoading}
                />
            </div>
        </AdminWrapper>
    );
};

export default JobList;