'use client';

import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import styled from "@emotion/styled";
import Tabs, { TabType } from "@/app/(main)/recherche/Tabs";
import { BlockWithChapter, ChunkWithScoreUnion, DocumentChunk } from "@/types/vectordb";
import { RenderSearchResult } from "@/app/(main)/recherche/RenderSearch";
import { useState } from "react";
import { Block } from "@prisma/client";
import { useSession } from "next-auth/react";
import RegisteredUserFeature from "@/components/RegisteredUserFeature";
import AutoBreadCrumb from "@/components/AutoBreadCrumb";



const RenderStarredKeyword = (props: { keyword: string, content: { documentChunks: ChunkWithScoreUnion[], blocks: BlockWithChapter[] } }) => {
    const { keyword, content } = props;
    const { documentChunks, blocks } = content;
    const [tabType, setTabType] = useState<TabType>(TabType.Documents)

    return (
        <div data-keyword={keyword} key={keyword} className='flex w-full flex-col gap-4'>
            <p className="text-xl font-bold">{keyword}</p>
            <Tabs blocks={blocks} chunks={documentChunks} selectedTabType={tabType} onTabChange={(newTabType) => setTabType(newTabType)} />

            <div className="overflow-auto w-full">
                <RenderSearchResult selectedTab={tabType} results={{ chunks: documentChunks, blocks: blocks, page_count: 1 }} searchWords={[]} resultPerPage={10} />
            </div>
            <hr />
        </div>
    )

}
export default function StarredContent() {

    const { data: session } = useSession();
    const user = session?.user;



    const { data: starredContent, isLoading, error } = useQuery({
        queryKey: ['starredContent'],
        queryFn: () => apiClient.getUserStarredContent()
    });


    if (!user)
        return <div className="fr-col-12 fr-container main-content-item py-4">
            <RegisteredUserFeature />
        </div>


    return (
        <div className="fr-container" >
            <div className="fr-grid-row fr-grid-row--center">
                <div className="fr-col-12 pt-8">
                    <AutoBreadCrumb />
                    <div className="w-full">
                        <h1 className="text-center text-black">
                            Mes favoris
                        </h1>
                    </div>

                    {starredContent &&
                        <div className="flex flex-col md:flex-row gap-4 md:gap-0 max-w-full w-full scroll-smooth">
                            <div className="relative py-4 md:py-8 w-full md:w-96">
                                <div className="flex flex-col gap-2 md:border-r border-[#DDDDDD]">
                                    <p className="mt-0 pt-4 flex-grow-0 flex-shrink-0 text-sm md:text-base font-bold text-left text-black">MOTS-CLÉS</p>
                                    {Object.keys(starredContent).map(keyword =>
                                        <>
                                            <p
                                                key={keyword}
                                                className="m-0 text-sm md:text-base cursor-pointer font-bold text-left text-[#161616] hover:text-blue-600"
                                                onClick={() => {
                                                    const div = document.querySelector(`[data-keyword="${keyword}"]`);
                                                    if (div) {
                                                        div.scrollIntoView({ behavior: 'smooth' });
                                                    }
                                                }}
                                            >{keyword}</p>
                                            <hr />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="relative w-full p-4 md:p-16">
                                {
                                    Object.entries(starredContent).map(([keyword, content]) => {
                                        console.log("KEY CHUNKS", keyword, content)
                                        return <RenderStarredKeyword key={keyword} keyword={keyword} content={content} />
                                    })
                                }
                            </div>
                        </div>}
                </div>
            </div>
        </div>
    );
}