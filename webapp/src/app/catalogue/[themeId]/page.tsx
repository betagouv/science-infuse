import { PrismaClient, EducationLevel, Chapter, Block, Theme } from '@prisma/client';
import ClientCatalogue from './ClientCatalogue';
import { ChapterWithBlock } from '@/lib/api-client';
import prisma from '@/lib/prisma';

interface ServerCatalogueProps {
    params: {
        themeId: string;
    };
}

async function getChaptersFiltersAndTheme(themeId: string) {

    const chapters: ChapterWithBlock[] = await prisma.chapter.findMany({
        where: {
            ...(themeId !== "all" && { themeId: themeId }),
            status: "REVIEW"
        },
        include: {
            skills: true,
            educationLevels: true,
            blocks: {
                include: {
                    keyIdeas: true,
                    activities: true,
                    tags: true
                }
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