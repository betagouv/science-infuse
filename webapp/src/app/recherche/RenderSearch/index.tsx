
import React, { useEffect, useMemo, useState } from "react";
import { ChunkWithScoreUnion, GroupedVideo, BlockWithChapter, ChunkWithScore, SearchResults, MediaType } from "@/types/vectordb";
import ChunkRenderer, { RenderChapter, RenderChapterBlock, RenderGroupedVideoTranscriptCard } from "../DocumentChunkFull";
import Masonry from '@mui/lab/Masonry';
import { ColumnsMediaTypeMap, selectedTabType, TabMediaTypeMap, TabType } from "../Tabs";
import { MasonaryItem } from "@/components/MasonaryItem";
import { ChapterWithBlock } from "@/lib/api-client";
import Pagination from "@codegouvfr/react-dsfr/Pagination";

export type OnInserted = {
  onInserted?: (chunk: ChunkWithScoreUnion) => void
}

export const groupVideo = (videoChunks: ChunkWithScore<"video_transcript">[]) => {
  // Group by documentId
  const groupedByDocId = videoChunks.reduce<Record<string, ChunkWithScore<"video_transcript">[]>>((acc, item) => {
    const docId = item.document.id;
    if (!acc[docId]) {
      acc[docId] = [];
    }
    acc[docId].push(item);
    return acc;
  }, {});

  // Calculate max score for each group
  const grouppedVideos = Object.entries(groupedByDocId).map(([docId, items]) => {
    const maxScore = Math.max(...items.map(item => item.score));
    return {
      documentId: docId,
      items: items,
      maxScore: maxScore
    };
  });

  // Sort the result array by maxScore
  grouppedVideos.sort((a, b) => b.maxScore - a.maxScore);

  return grouppedVideos as GroupedVideo[];
};


export const GroupedVideoChunkResults: React.FC<OnInserted & { groupedVideos: GroupedVideo[], searchWords: string[] }> = ({ onInserted, groupedVideos, searchWords }) => {
  return (
    <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
      {groupedVideos
        .slice()
        .map((video, index) => {
          return (
            <MasonaryItem key={index}>
              <RenderGroupedVideoTranscriptCard onInserted={onInserted} video={video} searchWords={searchWords} />
            </MasonaryItem>
          )
        })
      }
    </Masonry>
  )
}

export const ChapterResults: React.FC<OnInserted & { chapters: ChapterWithBlock[] }> = ({ chapters }) => {
  return <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
    {chapters
      .map((chapter, index) => (
        <MasonaryItem key={index}>
          <RenderChapter chapter={chapter} />
        </MasonaryItem>
      ))
    }
  </Masonry>
};

export const BlockResults: React.FC<OnInserted & { blocks: BlockWithChapter[], searchWords: string[] }> = ({ blocks, searchWords }) => {
  return <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
    {blocks
      .sort((a, b) => b.score - a.score)
      .map((block, index) => (
        <MasonaryItem key={index}>
          <RenderChapterBlock searchWords={searchWords} block={block} />
        </MasonaryItem>
      ))
    }
  </Masonry>
};

export const ChunkResults: React.FC<OnInserted & { chunks: ChunkWithScoreUnion[], searchWords: string[] }> = ({ onInserted, chunks, searchWords }) => {
  return <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
    {chunks
      .sort((a, b) => b.score - a.score)
      .map((result, index) => (
        <MasonaryItem key={index}>
          <ChunkRenderer onInserted={onInserted} chunk={result} searchWords={searchWords} />
        </MasonaryItem>
      ))
    }
  </Masonry>
};


export const RenderSearchResult = (props: OnInserted & { selectedTab: TabType, results: SearchResults, searchWords: string[], resultPerPage: number }) => {
  const [pageNumber, setPageNumber] = useState(1);

  const activeTypes = TabMediaTypeMap[selectedTabType.value] || [];
  const groupedVideos = useMemo(() => groupVideo(props.results.chunks.filter(c => c.mediaType == "video_transcript") as ChunkWithScore<"video_transcript">[]), [props.results.chunks]);
  const chunks = props.results.chunks
    .filter(chunk => activeTypes.includes(chunk.mediaType as MediaType));

  useEffect(() => {
    setPageNumber(1);
  }, [props.selectedTab])

  let pageCount = 1;
  if (props.selectedTab == TabType.Videos)
    pageCount = Math.max(1, Math.ceil(groupedVideos.length / props.resultPerPage))
  else
    pageCount = Math.max(1, Math.ceil(chunks.length / props.resultPerPage))



  return (
    <>

      {props.selectedTab === TabType.Chapters ?
        <BlockResults
          onInserted={props.onInserted}
          blocks={props.results.blocks}
          searchWords={props.searchWords} /> :
        props.selectedTab !== TabType.Videos ?
          <ChunkResults
            onInserted={props.onInserted}
            chunks={chunks.slice((pageNumber - 1) * props.resultPerPage, pageNumber * props.resultPerPage)}
            searchWords={props.searchWords}
          /> :
          <GroupedVideoChunkResults
            onInserted={props.onInserted}
            groupedVideos={groupedVideos.slice((pageNumber - 1) * props.resultPerPage, pageNumber * props.resultPerPage)}
            searchWords={props.searchWords}
          />
      }

      {selectedTabType.value != TabType.Chapters && <Pagination
        className="[&_ul]:justify-around"
        count={pageCount}
        defaultPage={Math.max(pageNumber, 1)}
        getPageLinkProps={(newPageNumber: number) => ({
          onClick: (e) => {
            e.preventDefault();
            setPageNumber(newPageNumber)
          },
          href: ``,
        })}
        showFirstLast
      />}

    </>
  )
}
