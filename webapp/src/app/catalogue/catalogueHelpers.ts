import prisma from "@/lib/prisma";
import { ChapterWithBlock } from "@/types/api";
import { userFullFields } from "../api/accessControl";

export interface ServerCatalogueProps {
    params: {
        themeId: string;
    };
}

export async function getChaptersFiltersAndTheme(themeId: string) {

    const chapters: ChapterWithBlock[] = await prisma.chapter.findMany({
        where: {
            ...(themeId !== "all" && { themeId: themeId }),
            status: "PUBLISHED"
        },
        include: {
            skills: true,
            theme: true,
            educationLevels: true,
            blocks: {
                include: {
                    keyIdeas: true,
                    activities: true,
                    tags: true
                }
            },
            user: {
                select: userFullFields
            }
        }
    });
    const filters = await prisma.educationLevel.findMany();

    const theme = await prisma.theme.findUnique({
        where: {
            id: themeId
        }
    });

    return { chapters, filters, theme };
}
