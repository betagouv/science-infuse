export interface FileExplorerDocument {
    originalPath: string;
    s3ObjectName: string;
    id: string;
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

    documents.forEach((doc) => {
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
        Object.values(node).map(({ node, children }) => {
            const collapsedChildren = collapseFolders(children);

            // Collapse if there's only one child and the current node has no document
            if (
                collapsedChildren.length === 1 &&
                !node.document // Ensure it's a folder, not a document
            ) {
                return {
                    ...collapsedChildren[0],
                    name: `${node.name}/${collapsedChildren[0].name}`, // Combine folder names
                };
            }

            return {
                ...node,
                children: collapsedChildren.length > 0 ? collapsedChildren : undefined,
            };
        });

    return collapseFolders(root);
}
