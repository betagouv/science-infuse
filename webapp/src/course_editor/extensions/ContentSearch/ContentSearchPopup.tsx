import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { BlockWithChapter, ChunkWithScoreUnion, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, SearchResults } from '@/types/vectordb';
import { WEBAPP_URL } from '@/config';
import { useQuery } from '@tanstack/react-query';
import { fetchSIContent } from '@/app/(main)/recherche/fetchSIContent';
import SearchBar from '@/components/search/SearchBar';
import Tabs, { selectedTabType, TabType } from '@/app/(main)/recherche/Tabs';
import { useOnClickOutside } from 'usehooks-ts'
import { ChunkResults, RenderSearchResult } from '@/app/(main)/recherche/RenderSearch';
import { apiClient } from '@/lib/api-client';


const ContentSearch = (props: { pos: number, editor: Editor; closePopup: () => void }) => {
  const [query, setQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const handleClosePopup = useCallback(() => {
    if (!ref.current) return;
    if (!ref.current.parentElement) return;
    ref.current.parentElement.style.opacity = '0';
    setTimeout(() => {
      props.closePopup();
    }, 400)
  }, [props]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClosePopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClosePopup]);


  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search-course', {
      query,
      filters: {
        limit: 1000
      }
    }],
    queryFn: fetchSIContent,
    enabled: !!query,
  });

  const insertChunk = (chunk: ChunkWithScoreUnion) => {
    console.log("insertChunk", chunk);

    switch (true) {
      case isPdfImageChunk(chunk):
        const src = `${WEBAPP_URL}/api/s3/presigned_url/object_name/${chunk.metadata.s3ObjectName}`;
        props.editor.chain().setImageBlockAt({ pos: props.pos, src }).focus().run();
        break;

      case isVideoTranscriptChunk(chunk):
        console.log("insertChunk videotranscript", chunk);
        props.editor.chain().insertContentAt(props.pos, {
          type: 'si-video',
          attrs: {
            startOffset: chunk.metadata.start,
            endOffset: chunk.metadata.end,
            chunk: chunk
          }
        }).focus().run();
        break;

      case isPdfTextChunk(chunk):
        const url = `${WEBAPP_URL}/pdf/${chunk.document.id}/${chunk.metadata.pageNumber}`
        const name = `${chunk.document.mediaName} - page ${chunk.metadata.pageNumber}`
        props.editor.chain()
          .insertContentAt(props.pos, `<blockquote>${chunk.text}<br/><br/><a href="${url}" target="_blank">${name}</a></blockquote>`)
          .setTextSelection({ from: props.pos, to: props.pos + chunk.text.length + name.length + 3 })
          .focus()
          .run();
        break;

      default:
        console.warn("Unknown chunk type", chunk);
        break;
    }

    handleClosePopup();
  }

  const ref = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (!ref.current) return;
    if (!ref.current.parentElement) return;
    ref.current.parentElement.style.opacity = '0';
    setTimeout(() => {
      if (ref.current && ref.current.parentElement) {
        ref.current.parentElement.style.opacity = '1';
      }
    }, 0)
  }, [ref])

  useOnClickOutside(ref, handleClosePopup)

  const [starredDocumentChunks, setStarredDocumentChunks] = useState<ChunkWithScoreUnion[]>([]);
  const [starredBlocks, setStarredBlocks] = useState<BlockWithChapter[]>([]);

  useEffect(() => {
    const fetchStarredItems = async () => {
      try {
        const response = await apiClient.getUserStarredContent();
        if (response) {
          setStarredDocumentChunks(Object.values(response).map(i => i.documentChunks).flat());
          setStarredBlocks(Object.values(response).map(i => i.blocks).flat());
        }
      } catch (error) {
        console.error('Error fetching starred items:', error);
      }
    };

    fetchStarredItems();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [tabType, setTabType] = useState(TabType.Favourites);

  return (
    <div className="flex h-full transition-[0.4s] w-full items-center justify-center bg-[#16161686]">

      <div ref={ref} className="flex flex-col items-center gap-8 bg-[#f6f6f6] rounded-lg shadow-lg p-16 w-[80vw] h-[90vh] max-w-[1200px] max-h-[90vh]">

        {isMounted && (
          <SearchBar handleSearch={(_query) => {
            setQuery(_query)
          }} />
        )}
        <Tabs
          selectedTabType={tabType}
          onTabChange={(newTabType) => setTabType(newTabType)}
          favourites={starredDocumentChunks}
          blocks={(results as SearchResults)?.blocks || []}
          chunks={(results as SearchResults)?.chunks || []}
        />

        <div className="overflow-auto w-full">


          {!isLoading && !isError && results && <RenderSearchResult
            favourites={starredDocumentChunks}
            onInserted={insertChunk}
            selectedTab={tabType}
            results={results}
            searchWords={[]}
            resultPerPage={10} />
          }

          {!isLoading && !isError && !results && tabType == TabType.Favourites && <RenderSearchResult
            selectedTab={tabType}
            onInserted={insertChunk}
            results={{ chunks: starredDocumentChunks, blocks: starredBlocks, page_count: 1 }}
            searchWords={[]} resultPerPage={10} />

          }
          {/* {!isLoading && !isError && !results && tabType == TabType.Favourites && <ChunkResults
            onInserted={insertChunk}
            chunks={starredDocumentChunks}
            searchWords={[]}
          />
          } */}
        </div>

      </div>
    </div>

  );
};
export default ContentSearch;
