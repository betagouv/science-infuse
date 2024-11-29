'use client';

import { QueryFunction, useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataGrid, GridColDef, GridLogicOperator, GridRowModel, GridToolbar, GridToolbarExport, GridToolbarQuickFilter } from '@mui/x-data-grid'
import { Chip, Checkbox, FormGroup, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material'
import { useState, useEffect } from 'react'
import { EducationLevel, UserRoles } from '@prisma/client'
import AdminWrapper from '../AdminWrapper';
import { UserFull, UserFullWithChapterCount } from '@/types/api';
import { apiClient } from '@/lib/api-client';
import { useSearchParams } from 'next/navigation';

const fetchUsers: QueryFunction<UserFullWithChapterCount[], [string]> = async ({ queryKey }) => {
    const toc = await apiClient.getUsers();
    return toc;
};

const AdminListUsers = () => {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const quickFilterValue = searchParams.get('q')
    const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers
    })

    const [openRolesDialog, setOpenRolesDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserFull | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<UserRoles[]>([]);

    const updateUserMutation = useMutation({
        mutationFn: (user: UserFull) => apiClient.updateUser(user, user.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    if (usersLoading) return <div className="w-full h-full flex items-center justify-center py-64">
        <CircularProgress />
    </div>
    if (usersError) return <p>Error fetching data</p>

    const columns: GridColDef[] = [
        { flex: 1, field: 'id', headerName: 'id', minWidth: 130, editable: true },
        { flex: 1, field: 'firstName', headerName: 'Prénom', minWidth: 130, editable: true },
        { flex: 1, field: 'lastName', headerName: 'Nom', minWidth: 150, editable: true },
        { flex: 1, field: 'email', headerName: 'Email', minWidth: 250, editable: false },
        { flex: 1, field: 'chapterCount', type: 'number', headerName: 'Chapitres', minWidth: 130, editable: false },
        { flex: 1, field: 'job', headerName: 'Métier', minWidth: 200, editable: true },
        { flex: 1, field: 'school', headerName: 'École', minWidth: 200, editable: true },
        {
            field: 'roles',
            headerName: 'Roles',
            editable: false,
            minWidth: 400,
            renderCell: (params) => (
                <div className='block'>
                    {params.value
                        .sort((a: UserRoles, b: UserRoles) => a.localeCompare(b))
                        .map((role: UserRoles) => (
                            <Chip key={role} label={role} style={{ margin: '2px' }} />
                        ))}
                    <Button onClick={() => handleOpenRolesDialog(params.row)}>Modifier</Button>
                </div>
            )
        },
        {
            field: 'educationLevels',
            headerName: "Niveaux d'éducation",
            editable: false,
            minWidth: 200,
            valueGetter: (value, row) => row.educationLevels.map((el: EducationLevel) => el.name).join(', '),
            renderCell: (params) => (
                <div className='block'>
                    {params.value.split(', ').map((name: string) => (
                        <Chip key={name} label={name} style={{ margin: '2px' }} />
                    ))}
                </div>
            )
        },
        { flex: 1, field: 'creationDate', headerName: 'Création', minWidth: 200, editable: false, valueFormatter: (value) => new Date(value).toLocaleDateString('fr-FR'), sortComparator: (v1, v2) => new Date(v1).getTime() - new Date(v2).getTime() },];

    const handleOpenRolesDialog = (user: UserFull) => {
        setSelectedUser(user);
        setSelectedRoles(user.roles);
        setOpenRolesDialog(true);
    };

    const handleCloseRolesDialog = () => {
        setOpenRolesDialog(false);
        setSelectedUser(null);
        setSelectedRoles([]);
    };

    const handleRoleChange = (role: UserRoles) => {
        setSelectedRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleSaveRoles = () => {
        if (selectedUser) {
            const updatedUser = { ...selectedUser, roles: selectedRoles };
            updateUserMutation.mutate(updatedUser);
            handleCloseRolesDialog();
        }
    };

    const handleRowUpdate = (newRow: GridRowModel) => {
        updateUserMutation.mutate(newRow as UserFull);
        return newRow;
    };

    return (
        <AdminWrapper>
            <DataGrid
                style={{ height: "90vh" }}
                rows={users || []}
                columns={columns}
                editMode="row"
                processRowUpdate={handleRowUpdate}
                slots={{
                    toolbar: () => (
                        <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <GridToolbarQuickFilter
                                placeholder='Rechercher'
                            />
                            <GridToolbarExport />

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
            <Dialog open={openRolesDialog} onClose={handleCloseRolesDialog}>
                <DialogTitle>Modifier les rôles</DialogTitle>
                <DialogContent>
                    <FormGroup>
                        {Object.values(UserRoles).map(role => (
                            <FormControlLabel
                                key={role}
                                control={
                                    <Checkbox
                                        checked={selectedRoles.includes(role)}
                                        onChange={() => handleRoleChange(role)}
                                    />
                                }
                                label={role}
                            />
                        ))}
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRolesDialog}>Annuler</Button>
                    <Button onClick={handleSaveRoles}>Enregistrer</Button>
                </DialogActions>
            </Dialog>
        </AdminWrapper>
    )
}

export default AdminListUsers;
