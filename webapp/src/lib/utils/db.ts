import { ChapterWithBlock, UserFull } from "@/types/api";
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
            commentThread: true,
            blocks: {
                include: {
                    keyIdeas: true,
                    activities: true,
                    tags: true,
                }
            },
            skills: true,
            educationLevels: true,
        }
    });
}

export const getUserFull = async (userId: string) => {
    const user: UserFull | null = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            firstName: true,
            job: true,
            email: true,
            roles: true,
            school: true,
            lastName: true,
            emailVerified: true,
            image: true,
            academyId: true,
            educationLevels: true,
            schoolSubjects: true,
        }
    });
    return user;
}