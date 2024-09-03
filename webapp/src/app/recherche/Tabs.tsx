import { ChunkSearchResults, ChunkWithScoreUnion, MediaType, MediaTypes } from "@/types/vectordb";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import styled from "@emotion/styled";
import { signal } from "@preact/signals-react";
import { useState } from "react";

// Define an enum for tab types
export enum TabType {
    Chapters = "chapters",
    Documents = "documents",
    Pictures = "pictures",
    Videos = "videos",
    Games = "games",
    Others = "others"
}

export const TabMediaTypeMap: Record<TabType, MediaType[]> = {
    [TabType.Chapters]: [],
    [TabType.Documents]: [MediaTypes.PdfText],
    [TabType.Pictures]: [MediaTypes.PdfImage, MediaTypes.RawImage],
    [TabType.Videos]: [MediaTypes.VideoTranscript],
    [TabType.Games]: [MediaTypes.WebsiteExperience],
    [TabType.Others]: [MediaTypes.WebsiteQa],
}

export const ColumnsMediaTypeMap: Record<TabType, number> = {
    [TabType.Chapters]: 2,
    [TabType.Documents]: 2,
    [TabType.Pictures]: 4,
    [TabType.Videos]: 3,
    [TabType.Games]: 2,
    [TabType.Others]: 2,
}

// Define an interface for tab items
interface TabItem {
    tabId: TabType;
    label: string;
}

const StyledTabs = styled.div`
  .fr-tabs {
    --tabs-height: 4rem !important;
    box-shadow: none !important;
    ul {
      position: relative;
    }
    ul::after {
      position: absolute;
      content: "";
      bottom: 4px;
      left: 0;
      z-index: 9;
      width: 100%;
      border-bottom: 1.5px solid #e1e1e1 !important;
    }
    li:has(button[aria-selected="true"]) {
      position: relative;
    }
    li:has(button[aria-selected="true"])::after {
      position: absolute;
      content: "";
      bottom: 0px;
      left: 5px;
      z-index: 10;
      width: calc(100% - 10px);
      border-bottom: 2px solid white !important;
    }
  }
  .fr-tabs::before {
    display: none !important;
  }
`;


export const selectedTabType = signal<TabType>(TabType.Chapters);

const TabsComponent = (props: { chunks: ChunkWithScoreUnion[] }) => {
    const getCount = (chunks: ChunkWithScoreUnion[], mediaTypes: MediaType[]) => chunks.filter(c => mediaTypes.includes(c.mediaType)).length;


    const tabs: TabItem[] = [
        { tabId: TabType.Chapters, label: "Chapitres (0)" },
        { tabId: TabType.Documents, label: `Documents (${getCount(props.chunks, TabMediaTypeMap[TabType.Documents])})` },
        { tabId: TabType.Pictures, label: `Images (${getCount(props.chunks, TabMediaTypeMap[TabType.Pictures])})` },
        { tabId: TabType.Videos, label: `Vidéos (${getCount(props.chunks, TabMediaTypeMap[TabType.Videos])})` },
        { tabId: TabType.Games, label: `Jeux (${getCount(props.chunks, TabMediaTypeMap[TabType.Games])})` },
        { tabId: TabType.Others, label: `Autres (${getCount(props.chunks, TabMediaTypeMap[TabType.Others])})` },
    ];

    return (
        <StyledTabs>
            <Tabs
                selectedTabId={selectedTabType.value}
                tabs={tabs}
                onTabChange={(tabId) => selectedTabType.value = tabId as TabType}
            >
                <></>
            </Tabs>
        </StyledTabs>
    );
};

export default TabsComponent;