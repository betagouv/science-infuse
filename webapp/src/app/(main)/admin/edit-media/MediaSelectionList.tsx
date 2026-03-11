'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Document, DocumentTag } from '@prisma/client';
import { s3ToPublicUrl } from '@/types/vectordb';

interface MediaSelectionListProps {
    documents: (Document & { tags: DocumentTag[] })[];
}

export default function MediaSelectionList({ documents }: MediaSelectionListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDocuments = documents.filter(doc =>
        doc.mediaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.title && doc.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.tags.some(tag => tag.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getMediaPreview = (document: Document) => {
        // Get file extension from mediaName or fallback to s3ObjectName
        let fileExtension = '';
        if (document.mediaName) {
            fileExtension = document.mediaName.split('.').pop()?.toLowerCase() || '';
        } else if (document.s3ObjectName) {
            fileExtension = document.s3ObjectName.split('.').pop()?.toLowerCase() || '';
        }
        
        // Try different URL sources
        let mediaUrl = '';
        if (document.s3ObjectName) {
            mediaUrl = s3ToPublicUrl(document.s3ObjectName);
        } else if (document.publicPath) {
            mediaUrl = document.publicPath;
        } else if (document.originalPath && document.originalPath.startsWith('http')) {
            mediaUrl = document.originalPath;
        }
        
        if (mediaUrl) {
            
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img 
                            src={mediaUrl} 
                            alt={document.mediaName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<span class="text-xl">🖼️</span>';
                                }
                            }}
                        />
                    </div>
                );
            } else if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xl">🎥</span>
                    </div>
                );
            } else if (['pdf'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xl">📄</span>
                    </div>
                );
            } else if (['doc', 'docx'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xl">📝</span>
                    </div>
                );
            } else if (['xls', 'xlsx'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xl">📊</span>
                    </div>
                );
            } else if (['ppt', 'pptx'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xl">📽️</span>
                    </div>
                );
            } else if (['txt', 'rtf'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xl">📄</span>
                    </div>
                );
            } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension || '')) {
                return (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xl">🗜️</span>
                    </div>
                );
            }
        }
        
        return (
            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                <span className="text-xl">📁</span>
            </div>
        );
    };

    const handleEditMedia = (documentId: string) => {
        router.push(`/admin/edit-media/${documentId}`);
    };

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="max-w-md">
                <Input
                    label="Rechercher un média"
                    nativeInputProps={{
                        value: searchTerm,
                        onChange: (e) => setSearchTerm(e.target.value),
                        placeholder: "Nom du fichier, titre ou tag..."
                    }}
                />
            </div>

            {/* Documents List */}
            <div className="space-y-4">
                {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Aucun média trouvé pour cette recherche.' : 'Aucun média disponible.'}
                    </div>
                ) : (
                    filteredDocuments.map((document) => (
                        <div
                            key={document.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center space-x-4">
                                {getMediaPreview(document)}
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                        {document.title || document.mediaName || document.s3ObjectName || 'Fichier sans nom'}
                                    </h4>
                                    <p className="text-sm text-gray-500 font-mono">
                                        {document.mediaName || document.s3ObjectName || 'Nom de fichier non disponible'}
                                    </p>
                                    {document.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {document.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                                                >
                                                    {tag.title}
                                                </span>
                                            ))}
                                            {document.tags.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                    +{document.tags.length - 3} autres
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                priority="secondary"
                                onClick={() => handleEditMedia(document.id)}
                                iconId="fr-icon-edit-line"
                            >
                                Modifier
                            </Button>
                        </div>
                    ))
                )}
            </div>

            {/* Results Count */}
            {filteredDocuments.length > 0 && (
                <div className="text-sm text-gray-500 text-center">
                    {filteredDocuments.length} média{filteredDocuments.length > 1 ? 's' : ''} trouvé{filteredDocuments.length > 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
