'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import { apiClient } from '@/lib/api-client';
import { Document, DocumentTag } from '@prisma/client';
import { s3ToPublicUrl } from '@/types/vectordb';
import TagManager from './TagManager';

interface EditMediaFormProps {
    document: Document & { tags: DocumentTag[] };
    allTags: DocumentTag[];
}

export default function EditMediaForm({ document, allTags }: EditMediaFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: document.title || '',
        credit: document.credit || '',
        source: document.source || '',
        isDownloadable: document.isDownloadable,
        tagIds: document.tags.map(tag => tag.id),
        identifier: document.identifier || '',
        description: document.description || ''
    });

    const [selectedTags, setSelectedTags] = useState<DocumentTag[]>(
        document.tags
    );

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleTagChange = (tags: DocumentTag[]) => {
        setSelectedTags(tags);
        setFormData(prev => ({
            ...prev,
            tagIds: tags.map(tag => tag.id)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await apiClient.updateDocument(document.id, formData);
            router.push('/admin/file-explorer');
        } catch (error) {
            console.error('Error updating document:', error);
            alert('Erreur lors de la mise à jour du document');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/file-explorer');
    };

    const getMediaPreview = () => {
        // Debug logging
        console.log('Document:', document.mediaName);
        console.log('S3 Object Name:', document.s3ObjectName);
        console.log('Public Path:', document.publicPath);
        console.log('Original Path:', document.originalPath);
        
        // Get file extension from mediaName or fallback to s3ObjectName
        let fileExtension = '';
        if (document.mediaName) {
            fileExtension = document.mediaName.split('.').pop()?.toLowerCase() || '';
        } else if (document.s3ObjectName) {
            fileExtension = document.s3ObjectName.split('.').pop()?.toLowerCase() || '';
        }
        console.log('File Extension:', fileExtension);
        
        // Try different URL sources
        let mediaUrl = '';
        if (document.s3ObjectName) {
            mediaUrl = s3ToPublicUrl(document.s3ObjectName);
        } else if (document.publicPath) {
            mediaUrl = document.publicPath;
        } else if (document.originalPath && document.originalPath.startsWith('http')) {
            mediaUrl = document.originalPath;
        }
        
        console.log('Media URL:', mediaUrl);
        
        if (mediaUrl) {
            
            if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 rounded-lg border overflow-hidden bg-gray-50">
                        <img 
                            src={mediaUrl} 
                            alt={document.mediaName}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = `
                                        <div class="w-full h-full flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="text-4xl text-gray-400 mb-2">🖼️</div>
                                                <p class="text-gray-600 text-sm">Image non disponible</p>
                                            </div>
                                        </div>
                                    `;
                                }
                            }}
                        />
                    </div>
                );
            } else if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-2">🎥</div>
                            <p className="text-gray-600 mb-2">Vidéo</p>
                            <p className="text-xs text-gray-500">{fileExtension?.toUpperCase()}</p>
                        </div>
                    </div>
                );
            } else if (['pdf'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-2">📄</div>
                            <p className="text-gray-600 mb-2">Document PDF</p>
                            <p className="text-xs text-gray-500">PDF</p>
                        </div>
                    </div>
                );
            } else if (['doc', 'docx'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-2">📝</div>
                            <p className="text-gray-600 mb-2">Document Word</p>
                            <p className="text-xs text-gray-500">{fileExtension?.toUpperCase()}</p>
                        </div>
                    </div>
                );
            } else if (['xls', 'xlsx'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-2">📊</div>
                            <p className="text-gray-600 mb-2">Tableur Excel</p>
                            <p className="text-xs text-gray-500">{fileExtension?.toUpperCase()}</p>
                        </div>
                    </div>
                );
            } else if (['ppt', 'pptx'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-2">📽️</div>
                            <p className="text-gray-600 mb-2">Présentation PowerPoint</p>
                            <p className="text-xs text-gray-500">{fileExtension?.toUpperCase()}</p>
                        </div>
                    </div>
                );
            } else if (['txt', 'rtf'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-2">📄</div>
                            <p className="text-gray-600 mb-2">Document texte</p>
                            <p className="text-xs text-gray-500">{fileExtension?.toUpperCase()}</p>
                        </div>
                    </div>
                );
            } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(fileExtension || '')) {
                return (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl text-gray-400 mb-2">🗜️</div>
                            <p className="text-gray-600 mb-2">Archive compressée</p>
                            <p className="text-xs text-gray-500">{fileExtension?.toUpperCase()}</p>
                        </div>
                    </div>
                );
            }
        }
        
        // Default placeholder for unknown types or no S3 object
        return (
            <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl text-gray-400 mb-2">📁</div>
                    <p className="text-gray-600 mb-2">Fichier média</p>
                    <p className="text-xs text-gray-500">
                        {fileExtension ? `Extension: ${fileExtension.toUpperCase()}` : 'Type inconnu'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {document.s3ObjectName ? 'S3: ✓' : 'S3: ✗'} | 
                        {document.publicPath ? 'Public: ✓' : 'Public: ✗'} | 
                        {document.originalPath ? 'Original: ✓' : 'Original: ✗'}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold mb-8">Modifier les informations</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Media Preview */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Média actuel</h2>
                    {getMediaPreview()}
                    <p className="text-sm text-gray-600 font-mono">{document.mediaName}</p>
                </div>

                {/* Right Column - Form */}
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <Input
                                label="Titre *"
                                nativeInputProps={{
                                    value: formData.title,
                                    onChange: (e) => handleInputChange('title', e.target.value),
                                    required: true
                                }}
                            />
                        </div>

                        {/* Credit */}
                        <div>
                            <Input
                                label="Crédit *"
                                nativeInputProps={{
                                    value: formData.credit,
                                    onChange: (e) => handleInputChange('credit', e.target.value),
                                    required: true
                                }}
                            />
                        </div>

                        {/* Source */}
                        <div>
                            <Input
                                label="Source *"
                                nativeInputProps={{
                                    value: formData.source,
                                    onChange: (e) => handleInputChange('source', e.target.value),
                                    required: true
                                }}
                            />
                        </div>

                        {/* Identifier */}
                        <div>
                            <Input
                                label="Identifiant"
                                nativeInputProps={{
                                    value: formData.identifier,
                                    onChange: (e) => handleInputChange('identifier', e.target.value)
                                }}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Input
                                label="Description"
                                textArea={true}
                                nativeTextAreaProps={{
                                    value: formData.description,
                                    onChange: (e) => handleInputChange('description', e.target.value),
                                    rows: 4
                                }}
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <TagManager
                                selectedTags={selectedTags}
                                allTags={allTags}
                                onTagsChange={handleTagChange}
                            />
                        </div>

                        {/* Downloadable Checkbox */}
                        <div>
                            <Checkbox
                                options={[
                                    {
                                        label: "Téléchargeable",
                                        nativeInputProps: {
                                            checked: formData.isDownloadable,
                                            onChange: (e) => handleInputChange('isDownloadable', e.target.checked)
                                        }
                                    }
                                ]}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6">
                            <Button
                                type="button"
                                priority="secondary"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                iconId="fr-icon-save-line"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
