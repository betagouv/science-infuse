import prisma from "@/lib/prisma";
import { getServerSession, User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { withAccessControl } from "@/app/api/accessControl";
import { CUSTOM_ERRORS } from "@/lib/customErrors";

export const POST = withAccessControl(
    { allowedRoles: ['*'] },
    async (request: NextRequest, { user, params }: { user: User, params: { id: string } }) => {
        try {

            const body = await request.json();
            const { reason } = body;

            if (!reason) {
                return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
            }

            const reportedChunk = await prisma.reportedDocumentChunk.create({
                data: {
                    userId: user.id,
                    documentChunkId: params.id,
                    reason: reason,
                },
                include: {
                    documentChunk: true,
                }
            });

            return NextResponse.json(reportedChunk);
        } catch (error: any) {
            console.error('Error reporting chunk:', error);
            if (error.code === 'P2002' && error.meta?.target?.includes('userId') && error.meta?.target?.includes('documentChunkId')) {
                return NextResponse.json({ error: CUSTOM_ERRORS.ALREADY_REPORTED }, { status: 400 });
            }
            return NextResponse.json({ error: 'Error reporting chunk' }, { status: 500 });
        }
    });