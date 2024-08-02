import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import axios from 'axios';
import { ChunkSearchResults, ChunkSearchResultsWithType, ChunkWithScore, ChunkWithScoreUnion, MediaType, MediaTypes } from '@/types/vectordb';
import { NEXT_PUBLIC_SERVER_URL } from '@/config';
import Masonry from '@mui/lab/Masonry';
import { useDebounce } from 'use-debounce';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSIContent } from '@/app/search/fetchSIContent';


const ImageSearchPopup = (props: { editor: Editor; closePopup: () => void }) => {
  const { editor, closePopup } = props;
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500);

  const queryClient = useQueryClient();

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['search'] });
  };

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', debouncedQuery, false, ["pdf_image"], 1, 10] as const,
    queryFn: fetchSIContent,
    enabled: !!debouncedQuery,
  },);

  console.log("resultsresultsresults", results)

  const insertImage = (src: string) => {
    closePopup();
    editor
      .chain()
      .setImageBlockAt({ pos: editor.state.selection.anchor, src: src })
      .focus()
      .run()

  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 w-full max-w-4xl mx-auto overflow-y-scroll h-[80vh] min-w-[calc(1000px-8rem)]">
      <input
        type="text"
        placeholder="Rechercher une image..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full p-2.5 border sticky top-0 bg-white z-10 border-gray-300 rounded-md text-sm mb-2.5"
      />
      <Masonry columns={2} spacing={2}>
        {results != undefined && (results as ChunkSearchResultsWithType<"pdf_image">).chunks.map((chunk, index) => {
          const image = `${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3_object_name}`;
          return (
            <div key={index} className="masonry-item">
              <img
                src={image}
                alt={image}
                onClick={() => insertImage(image)}
                className="w-full h-auto object-cover rounded-md cursor-pointer transition-opacity duration-200 hover:opacity-80"
              />
            </div>
          )
        })}
      </Masonry>
    </div>
  );
};

export default ImageSearchPopup;
