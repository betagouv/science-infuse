'use client';

import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, File, ExternalLink, X } from 'lucide-react';
import { buildFileTree, FileExplorerDocument, FileNode } from './file-utils';
import { s3ToPublicUrl } from '@/types/vectordb';
import { useEffect } from '@preact-signals/safe-react/react';
import CallOut from '@codegouvfr/react-dsfr/CallOut';
import Button from '@codegouvfr/react-dsfr/Button';
import AssignDocumentTags from './AssignDocumentTags';
import { Input } from "@codegouvfr/react-dsfr/Input";
import DesindexSelection from './DesindexSelection';
import IndexSelection from './IndexSelection';
import Badge from '@codegouvfr/react-dsfr/Badge';
import ClearDocumentTags from './ClearDocumentTags';

interface FileExplorerProps {
    documents: FileExplorerDocument[];
}

const FileExplorer: React.FC<FileExplorerProps> = ({ documents }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [deletedFilter, setDeletedFilter] = useState<'all' | 'deleted' | 'not-deleted'>('all');
    const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

    // Extract unique tags from documents
    const allTags = React.useMemo(() => {
        return Array.from(new Set(documents.flatMap(doc => doc.tags.map(tag => tag.title))));
    }, [documents]);

    const searchTermLower = searchTerm.toLowerCase();

    // Memoize fileTree computation with combined filtering and optimized filtering logic
    const fileTree = React.useMemo(() => {
        const filteredDocs = documents.filter((doc) => {
            if (searchTermLower) {
                const searchableText = `${doc.originalPath} ${doc.mediaName} ${doc.id}`.toLowerCase();
                if (!searchableText.includes(searchTermLower)) return false;
            }

            if (selectedTags.length > 0) {
                const docTagSet = new Set(doc.tags.map(tag => tag.title));
                if (!selectedTags.some(tag => docTagSet.has(tag))) return false;
            }

            if (deletedFilter !== 'all') {
                if (deletedFilter === 'deleted' && !doc.deleted) return false;
                if (deletedFilter === 'not-deleted' && doc.deleted) return false;
            }

            return true;
        });

        return buildFileTree(filteredDocs);
    }, [documents, searchTermLower, selectedTags, deletedFilter]);

    // Toggle tag selection
    const toggleTagSelection = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedTags([]);
        setDeletedFilter('all');
    };

    const selectedIds = React.useMemo(() =>
        Array.from(selectedNodes).filter(n => n.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/))
        , [selectedNodes]);

    const toggleSelectNode = useCallback((id: string, allChildrenIds: string[]) => {
        setSelectedNodes((prev) => {
            const newSelected = new Set(prev);

            if (newSelected.has(id)) {
                // Deselect node and all its children
                newSelected.delete(id);
                allChildrenIds.forEach((childId) => newSelected.delete(childId));
            } else {
                // Select node and all its children
                newSelected.add(id);
                allChildrenIds.forEach((childId) => newSelected.add(childId));
            }

            return newSelected;
        });
    }, []);
    return (
        <div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                    <div className="lg:col-span-3">
                        <Input
                            label="Rechercher"
                            nativeInputProps={{
                                type: "text",
                                value: searchTerm,
                                onChange: (e) => setSearchTerm(e.target.value),
                                placeholder: "Rechercher un fichier",
                            }}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filtrer par tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <Button
                                    key={tag}
                                    priority={selectedTags.includes(tag) ? 'primary' : 'secondary'}
                                    size="small"
                                    onClick={() => toggleTagSelection(tag)}
                                    className={`flex items-center gap-1 ${selectedTags.includes(tag)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    {tag}
                                    {selectedTags.includes(tag) && <X size={16} />}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Statut d'indexation
                        </label>
                        <div className="flex gap-2">
                            <Button
                                priority={deletedFilter === 'all' ? 'primary' : 'secondary'}
                                size="small"
                                onClick={() => setDeletedFilter('all')}
                            >
                                Tous
                            </Button>
                            <Button
                                priority={deletedFilter === 'not-deleted' ? 'primary' : 'secondary'}
                                size="small"
                                onClick={() => setDeletedFilter('not-deleted')}
                            >
                                Indexé
                            </Button>
                            <Button
                                priority={deletedFilter === 'deleted' ? 'primary' : 'secondary'}
                                size="small"
                                onClick={() => setDeletedFilter('deleted')}
                            >
                                Désindexé
                            </Button>
                        </div>
                    </div>

                    {(searchTerm || selectedTags.length > 0 || deletedFilter !== 'all') && (
                        <div className="lg:col-span-3 flex justify-end">
                            <Button
                                priority="secondary"
                                onClick={resetFilters}
                                className="flex items-center gap-1"
                            >
                                Réinitialiser les filtres
                                <X size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className='overflow-x-auto'>
                {fileTree.map((node, index) => (
                    <FileTreeNode
                        key={index}
                        {...node}
                        isRoot
                        selectedNodes={selectedNodes}
                        toggleSelectNode={toggleSelectNode}
                    />
                ))}
            </div>

            <div className='sticky -bottom-6 z-[1] py-4 mt-64 bg-white'>
                <CallOut
                    title={selectedIds.length == 0 ? `Séléctionner des documents pour effectuer une action` : `${selectedIds.length} documents séléctionnés.`}
                >
                    <div className="flex flex-col gap-4">
                        {selectedIds.length == 0 ? (
                            <p className="text-gray-600">
                                Les tags permettent d'appliquer facilement des actions à un groupe de documents, par exemple les désindexer.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Button priority="secondary" onClick={() => setSelectedNodes(new Set())}>
                                    Tout deselectionner
                                </Button>
                                <div className="flex flex-wrap gap-2">
                                    <AssignDocumentTags documentIds={selectedIds} />
                                    <DesindexSelection documentIds={selectedIds} />
                                    <ClearDocumentTags documentIds={selectedIds} />
                                    <IndexSelection documentIds={selectedIds} />
                                </div>
                            </div>
                        )}
                    </div>
                </CallOut>
            </div>
        </div>
    );
};



interface FileTreeNodeProps extends FileNode {
    isRoot?: boolean;
    selectedNodes: Set<string>;
    toggleSelectNode: (id: string, allChildrenIds: string[]) => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
    name,
    document,
    children,
    isRoot = false,
    selectedNodes,
    toggleSelectNode,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const documentDisplayName = document?.mediaName || name;

    const toggleExpand = () => {
        if (children && children.length > 0) {
            setIsExpanded((prev) => !prev);
        }
    };

    const getAllChildrenIds = (nodes: FileNode[] | undefined): string[] => {
        if (!nodes) return [];
        return nodes.flatMap((node) => [
            node.document?.id || '',
            ...getAllChildrenIds(node.children),
        ]).filter(Boolean);
    };

    const allChildrenIds = getAllChildrenIds(children);
    const isSelected = document?.id ? selectedNodes.has(document.id) : false;

    // Determine if parent is partially or fully selected
    const areAllChildrenSelected = allChildrenIds.every((id) => selectedNodes.has(id));
    const areSomeChildrenSelected = allChildrenIds.some((id) => selectedNodes.has(id));
    const isIndeterminate = areSomeChildrenSelected && !areAllChildrenSelected;

    return (
        <div className={`pl-${isRoot ? '2' : '4'} border-l`}>
            <div
                className="flex items-center cursor-pointer hover:bg-gray-100 py-1"
            >
                {children && children.length > 0 ? (
                    isExpanded ? (
                        <ChevronDown onClick={toggleExpand} className="w-4 h-4 min-w-4 mr-2 text-gray-700" />
                    ) : (
                        <ChevronRight onClick={toggleExpand} className="w-4 h-4 min-w-4 mr-2 text-gray-700" />
                    )
                ) : (
                    <File className="w-4 h-4 mr-2 text-gray-500" />
                )}
                <input
                    type="checkbox"
                    checked={(children && areAllChildrenSelected) || isSelected}
                    ref={(el) => {
                        if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => {
                        e.stopPropagation();
                        toggleSelectNode(document?.id || name, allChildrenIds);
                    }}
                    className="mr-2"
                />
                {!children && (document?.s3ObjectName || document?.originalPath.startsWith('http')) && (
                    <ExternalLink
                        className="mr-2 w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                                document.s3ObjectName
                                    ? s3ToPublicUrl(document.s3ObjectName)
                                    : document.originalPath,
                                '_blank',
                                'noopener,noreferrer'
                            );
                        }}
                    />
                )}
                <span className="text-sm">{documentDisplayName}</span>

                {!children && document?.id && (
                    <>
                        <a
                            className="ml-2 text-blue-500 hover:underline"
                            href={`/admin/inspect-document?documentId=${document.id}`}
                            target="_blank"
                        >
                            Inspecter
                        </a>
                        <div className="flex mx-2 gap-2">
                            {document.deleted == true && <Badge small noIcon severity="error"
                            >Désindexé</Badge>}
                            {document.tags.map(t => <Badge small key={t.id}>
                                {t.title}
                            </Badge>)}
                        </div>
                    </>

                )}
            </div>

            {isExpanded && children && (
                <div className="ml-4">
                    {children.map((child, index) => (
                        <FileTreeNode
                            key={index}
                            {...child}
                            selectedNodes={selectedNodes}
                            toggleSelectNode={toggleSelectNode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
