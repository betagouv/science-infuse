'use client';

import { QueryFunction, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataGrid, GridColDef, GridToolbarExport, GridToolbarQuickFilter } from '@mui/x-data-grid'
import { Chip, CircularProgress, Button, Box, Typography, Tabs, Tab } from '@mui/material'
import { UserRoles } from '@prisma/client'
import AdminWrapper from '../AdminWrapper';
import { UserFullWithChapterCount } from '@/types/api';
import { apiClient } from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useSnackbar } from '@/app/SnackBarProvider';

const fetchUsers: QueryFunction<UserFullWithChapterCount[], [string]> = async () => {
    return await apiClient.getUsers();
};

const AdminClubAda = () => {
    const queryClient = useQueryClient();
    const { showSnackbar } = useSnackbar();
    const searchParams = useSearchParams();
    const quickFilterValue = searchParams.get('q')
    const [tabValue, setTabValue] = useState(0);

    const { data: allUsers, isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['users-club-ada'],
        queryFn: fetchUsers
    })

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data }: { userId: string, data: any }) => apiClient.updateUser(data, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-club-ada'] });
        },
    });

    if (usersLoading) return <div className="w-full h-full flex items-center justify-center py-64">
        <CircularProgress />
    </div>
    if (usersError) return <p>Error fetching data</p>

    const handleAccept = (user: any) => {
        const newRoles = [...user.roles];
        if (!newRoles.includes(UserRoles.BETA_TESTER)) {
            newRoles.push(UserRoles.BETA_TESTER);
        }
        updateUserMutation.mutate({ 
            userId: user.id, 
            data: { roles: newRoles, requestedClubAda: false } 
        });
        showSnackbar(<p className="m-0">Utilisateur accepté dans le Club Ada</p>, 'success');
    };

    const handleReject = (user: any) => {
        updateUserMutation.mutate({ 
            userId: user.id, 
            data: { requestedClubAda: false } 
        });
        showSnackbar(<p className="m-0">Demande refusée</p>, 'info');
    };

    const handleRemove = (user: any) => {
        const newRoles = user.roles.filter((r: string) => r !== UserRoles.BETA_TESTER);
        updateUserMutation.mutate({ 
            userId: user.id, 
            data: { roles: newRoles } 
        });
        showSnackbar(<p className="m-0">Utilisateur retiré du Club Ada</p>, 'info');
    };

    const waitlistUsers = allUsers?.filter(u => (u as any).requestedClubAda) || [];
    const activeMembers = allUsers?.filter(u => u.roles.includes(UserRoles.BETA_TESTER)) || [];

    const columnsWaitlist: GridColDef[] = [
        { flex: 1, field: 'firstName', headerName: 'Prénom', minWidth: 130 },
        { flex: 1, field: 'lastName', headerName: 'Nom', minWidth: 150 },
        { flex: 1, field: 'email', headerName: 'Email', minWidth: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 250,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                    <Button variant="contained" color="success" size="small" onClick={() => handleAccept(params.row)}>
                        Accepter
                    </Button>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleReject(params.row)}>
                        Refuser
                    </Button>
                </Box>
            )
        }
    ];

    const columnsMembers: GridColDef[] = [
        { flex: 1, field: 'firstName', headerName: 'Prénom', minWidth: 130 },
        { flex: 1, field: 'lastName', headerName: 'Nom', minWidth: 150 },
        { flex: 1, field: 'email', headerName: 'Email', minWidth: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Button variant="outlined" color="error" size="small" onClick={() => handleRemove(params.row)}>
                        Retirer
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <AdminWrapper>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>Club Ada</Typography>
                <Typography variant="body1" color="text.secondary">Gérez les membres et les demandes d'adhésion au Club Ada.</Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label={`En attente (${waitlistUsers.length})`} />
                    <Tab label={`Membres actifs (${activeMembers.length})`} />
                </Tabs>
            </Box>

            <Box sx={{ height: "70vh" }}>
                {tabValue === 0 ? (
                    <DataGrid
                        rows={waitlistUsers}
                        columns={columnsWaitlist}
                        slots={{
                            toolbar: () => (
                                <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <GridToolbarQuickFilter placeholder='Rechercher' />
                                    <GridToolbarExport />
                                </div>
                            ),
                        }}
                        initialState={{ filter: { filterModel: { items: [], quickFilterValues: [quickFilterValue] } } }}
                    />
                ) : (
                    <DataGrid
                        rows={activeMembers}
                        columns={columnsMembers}
                        slots={{
                            toolbar: () => (
                                <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                    <GridToolbarQuickFilter placeholder='Rechercher' />
                                    <GridToolbarExport />
                                </div>
                            ),
                        }}
                        initialState={{ filter: { filterModel: { items: [], quickFilterValues: [quickFilterValue] } } }}
                    />
                )}
            </Box>
        </AdminWrapper>
    )
}

export default AdminClubAda;
