import prisma from "@/lib/prisma";
import { ChunkData, TableOfContents, TOCItem } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";



function createTocStructure(data: { path: string[]; page: number }[]): TableOfContents {
    const root: Record<string, any> = {};

    for (const item of data) {
        let current = root;
        for (let i = 0; i < item.path.length; i++) {
            const title = item.path[i];
            if (!(title in current)) {
                if (i === item.path.length - 1) {
                    current[title] = { page: item.page };
                } else {
                    current[title] = { items: {} };
                }
            }
            if (i < item.path.length - 1) {
                current = current[title].items;
            }
        }
    }

    function buildTocItems(node: Record<string, any>): TOCItem[] {
        const items: TOCItem[] = [];
        for (const [text, content] of Object.entries(node)) {
            if ("page" in content) {
                items.push({ text, page: content.page });
            } else {
                const subItems = buildTocItems(content.items);
                items.push({ text, page: 0, items: subItems });
            }
        }
        return items;
    }

    return { items: buildTocItems(root) };
}

async function getDocumentToc(documentUuid: string): Promise<TableOfContents> {
    const document = await prisma.document.findUnique({
        where: { id: documentUuid },
        include: {
            documentChunks: {
                include: {
                    metadata: true
                }
            }
        }
    })

    if (!document) return { items: [] }
    // Remove duplicates, keeping only the first occurrence (min page)
    const uniqueChunks: Record<string, ChunkData> = {};

    for (const chunk of document?.documentChunks) {
        const title = chunk.title.trim().replace(/^>/, '').trim();
        const page = chunk.metadata?.pageNumber || -1;
        if (!(title in uniqueChunks) || page < uniqueChunks[title].page) {
            uniqueChunks[title] = { title, page };
        }
    }

    const dedupedChunks = Object.values(uniqueChunks);
    const toc: { path: string[]; page: number }[] = [];
    const seenTitles = new Set<string>();

    for (const chunk of dedupedChunks) {
        const title = chunk.title;
        if (!seenTitles.has(title)) {
            toc.push({ path: title.split(">"), page: chunk.page });
            seenTitles.add(title);
        }
    }

    return createTocStructure(toc);
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    if (!id) {
        return new Response('Missing document_uuid parameter', { status: 400 })
    }

    try {
        const toc = await getDocumentToc(id);
        return NextResponse.json(toc)
    } catch (error) {
        console.error('Error building table of contents:', error);
        return NextResponse.json({ error: 'Error building table of contents' }, { status: 404 });
    }
}