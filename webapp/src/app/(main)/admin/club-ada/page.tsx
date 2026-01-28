'use client';

import { QueryFunction, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataGrid, GridColDef, GridToolbarExport, GridToolbarQuickFilter } from '@mui/x-data-grid'
import { Chip, CircularProgress, Button, Box, Typography, Tabs, Tab } from '@mui/material'
import { addToggleSwitchTranslations, ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { UserRoles, AdminSettingKey } from '@prisma/client'
import AdminWrapper from '../AdminWrapper';
import { UserFullWithChapterCount } from '@/types/api';
import { apiClient } from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useSnackbar } from '@/app/SnackBarProvider';

const fetchUsers: QueryFunction<UserFullWithChapterCount[], [string]> = async () => {
    return await apiClient.getUsers();
};

addToggleSwitchTranslations({
    lang: 'fr',
    messages: {
        checked: 'Club ada',
        unchecked: 'Tout le monde',
    },
});


const fetchSettings: QueryFunction<{ key: string; value: string }[], [string]> = async () => {
    return await apiClient.getAdminSettings();
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

    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: fetchSettings
    })

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data }: { userId: string, data: any }) => apiClient.updateUser(data, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-club-ada'] });
        },
    });

    const updateSettingMutation = useMutation({
        mutationFn: ({ key, value }: { key: string, value: string }) => apiClient.updateAdminSetting(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
            showSnackbar(<p className="m-0">Paramètre mis à jour</p>, 'success');
        },
    });

    if (usersLoading || settingsLoading) return <div className="w-full h-full flex items-center justify-center py-64">
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

    const getSettingValue = (key: string, defaultValue: boolean = false): boolean => {
        const setting = settings?.find(s => s.key === key);
        return setting ? setting.value === 'true' : defaultValue;
    };

    const handleToggleFeature = (key: string, checked: boolean) => {
        updateSettingMutation.mutate({ key, value: checked.toString() });
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

    const features = [
        { key: AdminSettingKey.FEATURE_DIALOGCARDS_BETA_ONLY, label: 'Dialogcards' },
        { key: AdminSettingKey.FEATURE_TEXTE_A_TROUS_BETA_ONLY, label: 'Texte à trous' },
        { key: AdminSettingKey.FEATURE_MOTS_CROISES_BETA_ONLY, label: 'Mots croisés' },
        { key: AdminSettingKey.FEATURE_QUIZZ_BETA_ONLY, label: 'Quizz' },
        { key: AdminSettingKey.FEATURE_VIDEO_INTERACTIVE_BETA_ONLY, label: 'Vidéo Interactive' },
        { key: AdminSettingKey.FEATURE_IMAGE_A_COMPLETER_BETA_ONLY, label: 'Image à compléter' },
        { key: AdminSettingKey.FEATURE_CHATBOT_BETA_ONLY, label: 'Chatbot' },
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
                    <Tab label="Fonctionnalités réservées" />
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
                ) : tabValue === 1 ? (
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
                ) : (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Contrôle d'accès aux fonctionnalités
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Activez les fonctionnalités ci-dessous pour les réserver uniquement aux membres du Club Ada (bêta-testeurs).
                            Si une fonctionnalité est désactivée, tous les utilisateurs y auront accès.
                        </Typography>
                        <div className='flex flex-col gap-4 text-nowrap'>
                            {features.map((feature) => (
                                <ToggleSwitch
                                    key={feature.key}
                                    label={feature.label}
                                    checked={getSettingValue(feature.key, false)}
                                    onChange={(checked) => handleToggleFeature(feature.key, checked)}
                                    disabled={updateSettingMutation.isPending}
                                    labelPosition='left'
                                />
                            ))}
                        </div>
                    </Box>
                )}
            </Box>
        </AdminWrapper>
    )
}

export default AdminClubAda;
