import { PrismaClient, EducationLevel, Chapter, Block, Theme } from '@prisma/client';
import { ChapterWithBlock } from '@/types/api';
import prisma from '@/lib/prisma';
import { userFullFields } from '@/app/api/accessControl';
import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { getChaptersFiltersAndTheme, getThemes, ServerCatalogueProps } from './catalogueHelpers';
import ClientCatalogue from './ClientCatalogue';


const ServerCatalogue: React.FC<ServerCatalogueProps> = async () => {
    const { chapters, filters, theme } = await getChaptersFiltersAndTheme('all');
    const allThemes = await getThemes();

    return <div className='w-full fr-grid-row fr-grid-row--center'>
        <div className='flex flex-col fr-container main-content-item mt-4'>
            <AutoBreadCrumb />
            <ClientCatalogue initialChapters={chapters} filters={filters} theme={theme} allThemes={allThemes} />
        </div>
    </div>
}

export default ServerCatalogue;