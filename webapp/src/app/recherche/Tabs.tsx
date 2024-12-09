import { BlockWithChapter, ChunkWithScore, ChunkWithScoreUnion, MediaType, MediaTypes } from "@/types/vectordb";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import styled from "@emotion/styled";
import { signal } from "@preact/signals-react";
import React from "react";

// Define an enum for tab types
export enum TabType {
  Favourites = "favourites",
  Chapters = "chapters",
  Documents = "documents",
  Pictures = "pictures",
  Videos = "videos",
  Games = "games",
  Others = "others"
}

const allTypes: MediaType[] = Object.values(MediaTypes);
export const TabMediaTypeMap: Record<TabType, MediaType[]> = {
  [TabType.Favourites]: allTypes,
  [TabType.Chapters]: [],
  [TabType.Documents]: [MediaTypes.PdfText],
  [TabType.Pictures]: [MediaTypes.PdfImage, MediaTypes.RawImage, MediaTypes.Image],
  [TabType.Videos]: [MediaTypes.VideoTranscript],
  [TabType.Games]: [MediaTypes.WebsiteExperience],
  [TabType.Others]: [MediaTypes.WebsiteQa],
}

export const ColumnsMediaTypeMap: Record<TabType, (isMobile: boolean) => number> = {
  [TabType.Favourites]: (isMobile: boolean) => isMobile ? 1:2,
  [TabType.Chapters]: (isMobile: boolean) => isMobile ? 1:2,
  [TabType.Documents]: (isMobile: boolean) => isMobile ? 1:2,
  [TabType.Pictures]: (isMobile: boolean) => isMobile ? 1:4,
  [TabType.Videos]: (isMobile: boolean) => isMobile ? 1:3,
  [TabType.Games]: (isMobile: boolean) => isMobile ? 1:2,
  [TabType.Others]: (isMobile: boolean) => isMobile ? 1:2,
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

const TabsComponent = (props: { favourites?: ChunkWithScoreUnion[], blocks: BlockWithChapter[], selectedTabType: TabType, chunks: ChunkWithScoreUnion[], onTabChange: (tabType: TabType) => void }) => {
  const getCount = (chunks: ChunkWithScoreUnion[], mediaTypes: MediaType[], favourites?: boolean) => chunks.filter(c => (mediaTypes.includes(c.mediaType) && (favourites ? c.user_starred : true))).length;
  const getVideoCount = (chunks: ChunkWithScoreUnion[]) => new Set(chunks.filter(c => c.mediaType == "video_transcript").map(c => c.document.id)).size

  const tabs: TabItem[] = [
    ...(props.favourites ? [{ tabId: TabType.Favourites, label: `Mes favoris (${props.chunks.length > 0 ? getCount(props.chunks, TabMediaTypeMap[TabType.Favourites], true) : props.favourites?.length})` }] : []),
    { tabId: TabType.Chapters, label: `Chapitres (${props.blocks.length})` },
    { tabId: TabType.Documents, label: `Documents (${getCount(props.chunks, TabMediaTypeMap[TabType.Documents])})` },
    { tabId: TabType.Pictures, label: `Images (${getCount(props.chunks, TabMediaTypeMap[TabType.Pictures])})` },
    { tabId: TabType.Videos, label: `Vidéos (${getVideoCount(props.chunks)})` },
    { tabId: TabType.Games, label: `Jeux (${getCount(props.chunks, TabMediaTypeMap[TabType.Games])})` },
    { tabId: TabType.Others, label: `Autres (${getCount(props.chunks, TabMediaTypeMap[TabType.Others])})` },
  ];

  return (
    <StyledTabs>
      <Tabs
        selectedTabId={props.selectedTabType}
        tabs={tabs}
        onTabChange={(tabId) => props.onTabChange(tabId as TabType)}
      // onTabChange={(tabId) => selectedTabType.value = tabId as TabType}
      >
        <></>
      </Tabs>
    </StyledTabs>
  );
};

export default TabsComponent;