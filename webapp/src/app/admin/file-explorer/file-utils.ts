import { DocumentTag } from "@prisma/client";

export interface FileExplorerDocument {
    originalPath: string;
    s3ObjectName: string;
    tags: DocumentTag[];
    id: string;
    deleted: boolean,
    mediaName: string;
}

export interface FileNode {
    name: string;
    document?: FileExplorerDocument;
    children?: FileNode[];
}

export function buildFileTree(documents: FileExplorerDocument[]): FileNode[] {
    const root: Record<
        string,
        { node: FileNode; children: Record<string, any> }
    > = {};

    // Sort documents by originalPath before processing
    const sortedDocuments = [...documents].sort((a, b) => a.originalPath.localeCompare(b.originalPath));

    sortedDocuments.forEach((doc) => {
        const urlParts = doc.originalPath.split('://');
        const pathParts = urlParts.length > 1 ? urlParts[1].split('/') : doc.originalPath.split('/');
        let currentLevel = root;

        pathParts.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    node: { name: part, children: [] },
                    children: {},
                };
            }

            // Assign document info at the leaf node
            if (index === pathParts.length - 1) {
                currentLevel[part].node.document = doc;
            }

            // Navigate to the next level
            currentLevel = currentLevel[part].children;
        });
    });

    // Function to collapse single-child folders recursively
    const collapseFolders = (
        node: Record<string, { node: FileNode; children: Record<string, any> }>
    ): FileNode[] =>
        Object.values(node)
            .map(({ node, children }) => {
                const collapsedChildren = collapseFolders(children);

                // If there's only one child and the current node has no document
                if (collapsedChildren.length === 1 && !node.document) {
                    // Get the child node
                    const childNode = collapsedChildren[0];
                    
                    // If the child also has exactly one child and no document, collapse recursively
                    if (childNode.children?.length === 1 && !childNode.document) {
                        let currentName = node.name;
                        let currentNode = childNode;
                        
                        // Keep collapsing until we find a node with multiple children or a document
                        while (
                            currentNode.children?.length === 1 && 
                            !currentNode.document
                        ) {
                            currentName = `${currentName}/${currentNode.name}`;
                            currentNode = currentNode.children[0];
                        }
                        
                        return {
                            ...currentNode,
                            name: `${currentName}/${currentNode.name}`,
                        };
                    }
                    
                    // Regular single-level collapse
                    return {
                        ...childNode,
                        name: `${node.name}/${childNode.name}`,
                    };
                }

                return {
                    ...node,
                    children: collapsedChildren.length > 0 ? collapsedChildren : undefined,
                };
            })
            .sort((a, b) => {
                // If both nodes have children or both don't have children, sort by name
                if (!!a.children === !!b.children) {
                    return a.name.localeCompare(b.name);
                }
                // If only one has children, put it first
                return a.children ? -1 : 1;
            });

    return collapseFolders(root);
}