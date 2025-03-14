import { PrismaClient, EducationLevel, Chapter, Block, Theme } from '@prisma/client';
import ClientCatalogue from '../ClientCatalogue';
import { ChapterWithBlock } from '@/types/api';
import prisma from '@/lib/prisma';
import { userFullFields } from '@/app/api/accessControl';
import AutoBreadCrumb from '@/components/AutoBreadCrumb';
import { getChaptersFiltersAndTheme, ServerCatalogueProps } from '../catalogueHelpers';


const ServerCatalogue: React.FC<ServerCatalogueProps> = async ({ params }) => {
    const { themeId } = params;
    const { chapters, filters, theme } = await getChaptersFiltersAndTheme(themeId);

    return <div className="w-full fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 fr-container main-content-item pt-8">
            <AutoBreadCrumb currentPageLabel={`${theme?.title}`}/>
            <ClientCatalogue initialChapters={chapters} filters={filters} theme={theme} />
        </div>
    </div>
}

export default ServerCatalogue;