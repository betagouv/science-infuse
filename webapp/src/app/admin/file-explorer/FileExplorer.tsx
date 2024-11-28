'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, ExternalLink } from 'lucide-react';
import { buildFileTree, FileNode } from './file-utils';
import { s3ToPublicUrl } from '@/types/vectordb';

interface FileExplorerProps {
    documents: { id: string; originalPath: string; s3ObjectName: string }[];
}

const FileExplorer: React.FC<FileExplorerProps> = ({ documents }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const fileTree = buildFileTree(
        documents.filter((doc) => doc.originalPath.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            <div>
                {fileTree.map((node, index) => (
                    <FileTreeNode key={index} {...node} isRoot />
                ))}
            </div>
        </div>
    );
};

interface FileTreeNodeProps extends FileNode {
    isRoot?: boolean;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ name, document, children, isRoot = false }) => {
    const [isExpanded, setIsExpanded] = useState(isRoot);

    const toggleExpand = () => {
        if (children && children.length > 0) {
            setIsExpanded((prev) => !prev);
        }
    };

    return (
        <div className={`pl-${isRoot ? '2' : '4'} border-l`}>
            <div
                className="flex items-center cursor-pointer hover:bg-gray-100 py-1"
                onClick={toggleExpand}
            >
                {children && children.length > 0 ? (
                    isExpanded ? (
                        <ChevronDown className="w-4 h-4 mr-2 text-gray-700" />
                    ) : (
                        <ChevronRight className="w-4 h-4 mr-2 text-gray-700" />
                    )
                ) : (
                    <File className="w-4 h-4 mr-2 text-gray-500" />
                )}
                {!children && (document?.s3ObjectName || document?.originalPath.startsWith('http')) && <ExternalLink
                    className="mr-2 w-4 h-4 text-blue-500 cursor-pointer hover:text-blue-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(document.s3ObjectName ? s3ToPublicUrl(document.s3ObjectName) : document.originalPath, '_blank', 'noopener,noreferrer');
                    }}
                />}

                <span className="text-sm">{name}</span>

                {!children && document?.id && (
                    <a
                        className="ml-2 text-blue-500 hover:underline"
                        href={`/admin/inspect-document?documentId=${document.id}`}
                        target="_blank"
                    >
                        Inspecter
                    </a>
                )}
            </div>

            {
                isExpanded && children && (
                    <div className="ml-4">
                        {children.map((child, index) => (
                            <FileTreeNode key={index} {...child} />
                        ))}
                    </div>
                )
            }
        </div >
    );
};

export default FileExplorer;
