import React, { useState, useCallback, useEffect } from 'react'
import styled from '@emotion/styled'
import { Editor } from '@tiptap/react'
import axios from 'axios'
import { ChunkWithScore, ChunkWithScoreUnion } from '@/types'
import { NEXT_PUBLIC_SERVER_URL } from '@/config'

const SearchWrapper = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  width: 300px;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 0.5rem;
`

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
`

const ImageItem = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`

const getSIImages = async (query: string) => {
    try {
      const response = await axios.post<ChunkWithScore<'pdf_image'>[]>(
        `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks`,
        {
          query: query,
          media_types: ["pdf_image"]
        }
      );
      const images = response.data.map((chunk) => `${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3_object_name}`)
      return images;
    } catch (error) {
      console.error("Error searching:", error);
    }
    return []
  };


const ImageSearchPopup = (props: { editor: Editor }) => {
    const { editor } = props;
    const [query, setQuery] = useState('')
    const [images, setImages] = useState<string[]>([])

    const searchImages = useCallback(async () => {
        // Replace this with your actual API call
        const images = await getSIImages(query);
        setImages(images)
    }, [query])

    useEffect(() => {
        if (query) {
            searchImages()
        }
    }, [query, searchImages])

    const insertImage = (src: string) => {
        editor
            .chain()
            .focus()
            .insertContentAt(editor.state.selection, { type: 'image', attrs: { src } })
            .run()

        // Close the popup
        const popup = document.querySelector('.tippy-box')
        // if (popup) {
            // popup._tippy.destroy()
        // }
    }

    return (
        <SearchWrapper>
            <SearchInput
                type="text"
                placeholder="Search images..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
            />
            <ImageGrid>
                {images.map((image, index) => (
                    <ImageItem
                        key={index}
                        src={image}
                        alt={image}
                        onClick={() => insertImage(image)}
                    />
                ))}
            </ImageGrid>
        </SearchWrapper>
    )
}

export default ImageSearchPopup