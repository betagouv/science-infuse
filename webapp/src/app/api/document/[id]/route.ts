import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { getServerSession, User } from "next-auth";
import { withAccessControl } from "../../accessControl";

export const GET = withAccessControl(
    { allowedRoles: ['ADMIN'] },
    async (request: NextRequest, { user, params }: { user: User, params: { id: string } }) => {
        const document = await prisma.document.findUnique({
            where: { id: params.id },
            include: {
                documentChunks: {
                    include: {
                        metadata: true,
                        document: true,
                    }
                }
            }
        })
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
        const session = await getServerSession(authOptions);

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
