import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import axios from 'axios';
import { ChunkWithScore, ChunkWithScoreUnion } from '@/types';
import { NEXT_PUBLIC_SERVER_URL } from '@/config';
import Masonry from '@mui/lab/Masonry';
import { useDebounce } from 'use-debounce';

const getSIImages = async (query: string) => {
  try {
    const response = await axios.post<ChunkWithScore<'pdf_image'>[]>(
      `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks`,
      {
        query: query,
        media_types: ["pdf_image"]
      }
    );
    const images = response.data.map((chunk) => `${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3_object_name}`);
    return images;
  } catch (error) {
    console.error("Error searching:", error);
  }
  return [];
};

const ImageSearchPopup = (props: { editor: Editor; closePopup: () => void }) => {
  const { editor, closePopup } = props;
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500); // Adjust the debounce delay as needed
  const [images, setImages] = useState<string[]>([]);

  const searchImages = useCallback(async () => {
    const images = await getSIImages(debouncedQuery);
    setImages(images);
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      searchImages();
    }
  }, [debouncedQuery, searchImages]);

  const insertImage = (src: string) => {
    closePopup();
    editor
      .chain()
      .focus()
      .insertContentAt(editor.state.selection, { type: 'image', attrs: { src } })
      .run();


    // Close the popup
    const popup = document.querySelector('.tippy-box');
    // if (popup) {
    // popup._tippy.destroy()
    // }
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
        {images.map((image, index) => (
          <div key={index} className="masonry-item">
            <img
              src={image}
              alt={image}
              onClick={() => insertImage(image)}
              className="w-full h-auto object-cover rounded-md cursor-pointer transition-opacity duration-200 hover:opacity-80"
            />
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default ImageSearchPopup;
