
import React, { useRef, useState } from 'react';
import { Editor } from '@tiptap/react';
import { ChunkWithScoreUnion, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, SearchResults } from '@/types/vectordb';
import { WEBAPP_URL } from '@/config';
import { useQuery } from '@tanstack/react-query';
import { fetchSIContent } from '@/app/recherche/fetchSIContent';
import SearchBar from '@/components/search/SearchBar';
import Tabs, { selectedTabType, TabType } from '@/app/recherche/Tabs';
import { useOnClickOutside } from 'usehooks-ts'
import { useEffect } from '@preact-signals/safe-react/react';
import { ChunkResults, RenderSearchResult } from '@/app/recherche/RenderSearch';
import { apiClient } from '@/lib/api-client';


const ContentSearch = (props: { pos: number, editor: Editor; closePopup: () => void }) => {
  const [query, setQuery] = useState('');
  const handleClosePopup = () => {
    if (!ref.current) return;
    if (!ref.current.parentElement) return;
    ref.current.parentElement.style.opacity = '0';
    setTimeout(() => {
      props.closePopup();
    }, 400)
  }

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
    queryKey: [query, undefined, 1000] as const,
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
        props.editor.chain()
          .insertContentAt(props.pos, chunk.text)
          .setTextSelection({ from: props.pos, to: props.pos + chunk.text.length })
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

  const [starredItems, setStarredItems] = useState<ChunkWithScoreUnion[]>([]);

  useEffect(() => {
    const fetchStarredItems = async () => {
      try {
        const response = await apiClient.getStarDocumentChunk();
        if (response)
          setStarredItems(Object.values(response).flat());
      } catch (error) {
        console.error('Error fetching starred items:', error);
      }
    };

    fetchStarredItems();
  }, []);


  console.log("selectedTabType.value", selectedTabType.value)

  return (
    <div className="flex h-full transition-[0.4s] w-full items-center justify-center bg-[#16161686]">

      <div ref={ref} className="flex flex-col items-center gap-8 bg-[#f6f6f6] rounded-lg shadow-lg p-16 w-[80vw] h-[90vh] max-w-[1200px] max-h-[90vh]">

        <SearchBar handleSearch={(_query) => {
          console.log("query", _query)
          setQuery(_query)
        }} />
        <Tabs favourites={starredItems} blocks={(results as SearchResults)?.blocks || []} chunks={(results as SearchResults)?.chunks || []} />

        <div className="overflow-auto w-full">


          {!isLoading && !isError && results && <RenderSearchResult
            favourites={starredItems}
            onInserted={insertChunk}
            selectedTab={selectedTabType.value}
            results={results}
            searchWords={[]}
            resultPerPage={10} />
          }

          {!isLoading && !isError && !results && selectedTabType.value == TabType.Favourites && <ChunkResults
            onInserted={insertChunk}
            chunks={starredItems}
            searchWords={[]}
          />
          }
        </div>

      </div>
    </div>

  );
};

export default ContentSearch;