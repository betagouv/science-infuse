import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { withAccessControl } from "../accessControl";

export const GET = withAccessControl(
    { allowedRoles: ['*'] },
    async (request: NextRequest) => {
        try {
            const tags = await prisma.documentTag.findMany({
                orderBy: { title: 'asc' }
            });
            return NextResponse.json(tags);
        } catch (error) {
            console.error('Error fetching document tags:', error);
            return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
        }
    }
);

export const POST = withAccessControl(
    { allowedRoles: ['ADMIN'] },
    async (request: NextRequest) => {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            const body = await request.json();
            const { title, description } = body;

            if (!title || !description) {
                return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
            }

            const tag = await prisma.documentTag.create({
                data: {
                    title,
                    description
                }
            });

            return NextResponse.json(tag);
        } catch (error) {
            console.error('Error creating document tag:', error);
            return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
        }
    }
);
