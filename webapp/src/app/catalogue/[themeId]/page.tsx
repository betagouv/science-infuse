import { PrismaClient, EducationLevel, Chapter, Block, Theme } from '@prisma/client';
import ClientCatalogue from './ClientCatalogue';
import { ChapterWithBlock } from '@/types/api';
import prisma from '@/lib/prisma';
import { userFullFields } from '@/app/api/accessControl';

interface ServerCatalogueProps {
    params: {
        themeId: string;
    };
}

async function getChaptersFiltersAndTheme(themeId: string) {

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

const ServerCatalogue: React.FC<ServerCatalogueProps> = async ({ params }) => {
    const { themeId } = params;
    const { chapters, filters, theme } = await getChaptersFiltersAndTheme(themeId);

    return <ClientCatalogue initialChapters={chapters} filters={filters} theme={theme} />;
}

export default ServerCatalogue;