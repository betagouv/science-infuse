'use client'

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
import { Button } from '@codegouvfr/react-dsfr/Button';

import { apiClient } from '@/lib/api-client';
import { useSnackbar } from '@/app/SnackBarProvider';
import { DocumentTag } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminWrapper from '../AdminWrapper';
import { 
    FileText, 
    FileImage, 
    FileVideo, 
    FileAudio, 
    File,
    Calendar, 
    User, 
    Tag, 
    Edit, 
    Trash2, 
    Search,
    Plus,
    FolderOpen,
    Clock
} from 'lucide-react';

interface DraftFile {
    id: string;
    originalName: string;
    s3ObjectName: string;
    mimeType: string;
    size: number;
    createdAt: string;
}

interface Draft {
    id: string;
    title?: string;
    credit?: string;
    source?: string;
    isDownloadable: boolean;
    documentTagIds: string[];
    files: DraftFile[];
    userId: string;
    createdAt: string;
    updatedAt: string;
    documentTags?: DocumentTag[];
}

const DraftsPage = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (session?.user?.id) {
            loadDrafts();
        }
    }, [session?.user?.id]);

    const loadDrafts = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.getAllDrafts();
            setDrafts(response.drafts || []);
        } catch (error) {
            console.error('Error loading drafts:', error);
            showSnackbar(
                <p className="m-0">Erreur lors du chargement des brouillons.</p>,
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const loadDraftIntoForm = (draftId: string) => {
        router.push(`/admin/index-content?draftId=${draftId}`);
    };

    const deleteDraft = async (draftId: string) => {
        try {
            await apiClient.deleteDraftById(draftId);
            setDrafts(drafts.filter(draft => draft.id !== draftId));
            showSnackbar(
                <p className="m-0">Brouillon supprimé avec succès.</p>,
                'success'
            );
        } catch (error) {
            console.error('Error deleting draft:', error);
            showSnackbar(
                <p className="m-0">Erreur lors de la suppression du brouillon.</p>,
                'error'
            );
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return FileImage;
        if (mimeType.startsWith('video/')) return FileVideo;
        if (mimeType.startsWith('audio/')) return FileAudio;
        if (mimeType.includes('pdf') || mimeType.includes('text')) return FileText;
        return File;
    };

    const getFileTypeColor = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800';
        if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-800';
        if (mimeType.startsWith('audio/')) return 'bg-blue-100 text-blue-800';
        if (mimeType.includes('pdf') || mimeType.includes('text')) return 'bg-red-100 text-red-800';
        return 'bg-gray-100 text-gray-800';
    };

    const filteredDrafts = drafts.filter(draft => 
        draft.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.credit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        draft.files.some(file => file.originalName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <AdminWrapper>
                <div className="flex justify-center items-center min-h-64">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Chargement...</span>
                    </div>
                </div>
            </AdminWrapper>
        );
    }

    return (
        <AdminWrapper>
            <div className="px-3 sm:px-4 py-4 sm:py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Mes Brouillons</h1>
                        <p className="text-sm sm:text-base text-gray-600">Gérez vos brouillons d'indexation de contenu</p>
                    </div>
                    <Button
                    priority='secondary'
                        className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
                        onClick={() => router.push('/admin/index-content')}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Nouveau brouillon</span>
                        <span className="sm:hidden">Nouveau</span>
                    </Button>
                </div>

                {/* Search Bar */}
                {drafts.length > 0 && (
                    <div className="relative mb-4 sm:mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Rechercher dans les brouillons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}

                {drafts.length === 0 ? (
                    <Card className="max-w-md mx-auto">
                        <CardContent className="text-center py-12">
                            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Aucun brouillon trouvé
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Créez votre premier brouillon en commençant un nouvel indexage de contenu.
                            </p>
                            <Button
                                className="flex items-center gap-2 mx-auto bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => router.push('/admin/index-content')}
                            >
                                <Plus className="w-4 h-4" />
                                Commencer un nouvel indexage
                            </Button>
                        </CardContent>
                    </Card>
                ) : filteredDrafts.length === 0 ? (
                    <Card className="max-w-md mx-auto">
                        <CardContent className="text-center py-12">
                            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Aucun résultat trouvé
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Essayez de modifier votre recherche ou créez un nouveau brouillon.
                            </p>
                            <div className="flex gap-2 justify-center">
                                <Button
                                priority='secondary'
                                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Effacer la recherche
                                </Button>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => router.push('/admin/index-content')}
                                >
                                    Nouveau brouillon
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredDrafts.map((draft) => (
                            <Card key={draft.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 h-full flex flex-col">
                                <CardHeader className="pb-3 flex-shrink-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                {draft.title || 'Brouillon sans titre'}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1 text-xs sm:text-sm">
                                                <Clock className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">Modifié le {new Date(draft.updatedAt).toLocaleDateString('fr-FR')}</span>
                                            </CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                                            {draft.files.length} fichier{draft.files.length > 1 ? 's' : ''}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 flex-1">
                                    {/* Metadata */}
                                    <div className="space-y-2">
                                        {draft.credit && (
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{draft.credit}</span>
                                            </div>
                                        )}
                                        {draft.source && (
                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                                                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{draft.source}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {draft.documentTags && draft.documentTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {draft.documentTags.map((tag) => (
                                                <Badge key={tag.id} variant="outline" className="text-xs">
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    {tag.title}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Files */}
                                    {draft.files.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <File className="w-3 h-3 sm:w-4 sm:h-4" />
                                                Fichiers
                                            </h4>
                                            <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                                                {draft.files.map((file) => {
                                                    const FileIcon = getFileIcon(file.mimeType);
                                                    return (
                                                        <div key={file.id} className="flex items-center gap-2 p-1.5 sm:p-2 bg-gray-50 rounded text-xs sm:text-sm">
                                                            <FileIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                                                            <span className="flex-1 truncate text-gray-700 min-w-0">{file.originalName}</span>
                                                            <Badge className={`text-xs ${getFileTypeColor(file.mimeType)} flex-shrink-0`}>
                                                                {formatFileSize(file.size)}
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="pt-0 flex-shrink-0">
                                    <div className="flex gap-1.5 sm:gap-2 w-full">
                                        <Button
                                            className="flex-1 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                                            onClick={() => loadDraftIntoForm(draft.id)}
                                        >
                                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">Charger</span>
                                            <span className="sm:hidden">Load</span>
                                        </Button>
                                        <Button
                                        priority='tertiary no outline'
                                            className="hover:border-red-600 px-2 sm:px-3 text-red-600"
                                            onClick={() => deleteDraft(draft.id)}
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AdminWrapper>
    );
};

export default DraftsPage;
