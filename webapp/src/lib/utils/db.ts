import { ChapterWithBlock } from "../api-client";
import prisma from "../prisma";

export const getChaptersWithBlocks = async (userId: string): Promise<ChapterWithBlock[]> => {
    return await prisma.chapter.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            blocks: {
                include: {
                    keyIdeas: true,
                    activities: true,
                    tags: true
                }
            },
            skills: true,
            educationLevels: true,
        }
    });
}