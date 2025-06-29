import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { withAccessControl } from "../../accessControl";
import { auth } from "@/auth";
import { User } from "next-auth";

export const GET = withAccessControl(
    { allowedRoles: ['*'] },
    async (request: NextRequest, { user, params }: { user: User, params: { id: string } }) => {
        const session = await auth();
        const userId = session?.user.id

        const document = await prisma.document.findUnique({
            where: { id: params.id },
            include: {
                tags: true,
                documentChunks: {
                    include: {
                        metadata: true,
                        document: true,
                    }
                }
            }
        })
        // if (!document || (document.isPublic == false && document.userId != userId)) {
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        const { documentChunks, ...documentWithoutChunks } = document || {};
        const documentWithAliasedChunks = {
            ...documentWithoutChunks,
            chunks: documentChunks
        };
        return NextResponse.json(documentWithAliasedChunks);
    }
)

export const DELETE = withAccessControl(
    { allowedRoles: ['ADMIN'] },
    async (request: NextRequest, { user, params }: { user: User, params: { id: string } }) => {
        const session = await auth();

        const id = params.id;

        if (!id) {
            return new Response('Missing id parameter', { status: 400 })
        }

        try {
            await prisma.document.update({
                where: { id: id },
                data: {
                    deleted: true,
                }
            });

            return NextResponse.json(true);

        } catch (error) {
            console.error('Error:', error);
            return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
        }
    })
