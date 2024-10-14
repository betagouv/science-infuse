import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { apiClient } from '@/lib/api-client';
import { PgBossJobGetIndexFileResponse } from '@/app/api/queueing/data/index-file/types';
import { Chip } from '@mui/material';

const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 100 },
    //   { field: 'name', headerName: 'Name', width: 150 },
    {
        field: 'state',
        headerName: 'Etat',
        width: 120,
        renderCell: (params) => {
            const state = params.value as 'created' | 'retry' | 'active' | 'completed' | 'cancelled' | 'failed';
            const color =
                state === 'created' ? 'default' :
                    state === 'retry' ? 'warning' :
                        state === 'active' ? 'info' :
                            state === 'completed' ? 'success' :
                                state === 'cancelled' ? 'error' :
                                    state === 'failed' ? 'error' : 'default';

            return <Chip label={state} color={color} size="small" />;
        }
    },
    { field: 'author', headerName: 'Source', width: 150, valueGetter: (value, row) => row.data?.author },
    { field: 'filePath', headerName: 'Fichier', width: 200, valueGetter: (value, row) => row.data?.filePath },
    { field: 'started_on', headerName: 'Démarré le', width: 200, valueFormatter: (value, row) => value ? new Date(value).toLocaleString('fr-FR') : 'N/A' },
    { field: 'created_on', headerName: 'Créé le', width: 200, valueFormatter: (value, row) => value ? new Date(value).toLocaleString('fr-FR') : 'N/A' },
    { field: 'completed_on', headerName: 'Terminé le', width: 200, valueFormatter: (value, row) => value ? new Date(value).toLocaleString('fr-FR') : 'N/A' },
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
        }
    },
]; const JobList: React.FC = () => {
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });

    const { data, isLoading, isError } = useQuery<PgBossJobGetIndexFileResponse>({
        queryKey: ['jobs', paginationModel.page, paginationModel.pageSize],
        queryFn: () => apiClient.fetcheIndexFileJobs(paginationModel.page + 1, paginationModel.pageSize),
    });

    const handlePaginationModelChange = (newPaginationModel: GridPaginationModel) => {
        setPaginationModel(newPaginationModel);
    };

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching jobs</div>;

    return (
        <div className='flex flex-col'>
            <h1>Job List</h1>
            <DataGrid
                rows={data?.jobs || []}
                columns={columns}
                paginationMode="server"
                pageSizeOptions={[10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={handlePaginationModelChange}
                rowCount={data?.pagination.totalCount || 0}
                loading={isLoading}
            />
        </div>
    );
};

export default JobList;