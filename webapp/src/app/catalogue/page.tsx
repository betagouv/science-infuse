import { PrismaClient, EducationLevel, Chapter, Block, Theme } from '@prisma/client';
import { ChapterWithBlock } from '@/types/api';
import prisma from '@/lib/prisma';
import { userFullFields } from '@/app/api/accessControl';
import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { getChaptersFiltersAndTheme, ServerCatalogueProps } from './catalogueHelpers';
import ClientCatalogue from './ClientCatalogue';


const ServerCatalogue: React.FC<ServerCatalogueProps> = async () => {
    const { chapters, filters, theme } = await getChaptersFiltersAndTheme('all');

    return <div className="w-full fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-container main-content-item pt-8">
        <AutoBreadCrumb />
            <ClientCatalogue initialChapters={chapters} filters={filters} theme={theme} />
        </div>
    </div>
}

export default ServerCatalogue;