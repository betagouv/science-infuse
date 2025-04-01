'use client';
import Input from '@codegouvfr/react-dsfr/Input';
import Button from '@codegouvfr/react-dsfr/Button';
import AdminWrapper from '../AdminWrapper';
import prisma from '@/lib/prisma';
import { getAdminSettings, setAdminSetting } from '@/lib/utils/db';
import { useState, useEffect } from 'react';
import { AdminSetting } from '@prisma/client';

const AdminSettings = () => {
    const [settings, setSettings] = useState<AdminSetting[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    useEffect(() => {
        const fetchSettings = async () => {
            const adminSettings = await getAdminSettings();
            setSettings(adminSettings);
        };
        fetchSettings();
    }, []);

    const handleSave = async (setting: AdminSetting) => {
        await setAdminSetting(setting.id, setting.key, editValue);
        setEditingId(null);
        const adminSettings = await getAdminSettings();
        setSettings(adminSettings);
    };

    return (
        <AdminWrapper>
            <div className="fr-container fr-my-8w">
                <h1 className="fr-h3 fr-mb-4w">Paramètres administrateur</h1>
                <div className="overflow-auto">

                    <div className="!table fr-table w-full whitespace-nowrap">
                        <table className="fr-table !table w-full">
                            <thead>
                                <tr>
                                    <th>Paramètre</th>
                                    <th>Description</th>
                                    <th>Valeur</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {settings.map((setting) => (
                                    <tr key={setting.id}>
                                        <td>{setting.key}</td>
                                        <td>{setting.description}</td>
                                        <td>
                                            {editingId === setting.id ? (
                                                <Input
                                                    label=""
                                                    nativeInputProps={{
                                                        value: editValue,
                                                        onChange: (e) => setEditValue(e.target.value)
                                                    }}
                                                />
                                            ) : (
                                                setting.value
                                            )}
                                        </td>
                                        <td>
                                            {editingId === setting.id ? (
                                                <div className="flex flex-row gap-2">
                                                    <Button
                                                        onClick={() => handleSave(setting)}
                                                        priority="secondary"
                                                        size="small"
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                    <Button
                                                        onClick={() => setEditingId(null)}
                                                        priority="tertiary"
                                                        size="small"
                                                    >
                                                        Annuler
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    onClick={() => {
                                                        setEditingId(setting.id);
                                                        setEditValue(setting.value);
                                                    }}
                                                    priority="secondary"
                                                    size="small"
                                                >
                                                    Modifier
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminWrapper>
    )
}

export default AdminSettings;