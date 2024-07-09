"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import assert from "assert";
import { Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ChunkWithScoreUnion, DocumentSearchResult } from "@/types";
import { signal } from "@preact/signals-react";
import { getSearchWords } from "./text-highlighter";
import DocumentCardWithChunks from "./DocumentCardWithChunks";
import FilterMenu, { checkedMediaTypes } from "./FilterMenu";
import DocumentChunkFull from "./DocumentChunkFull";
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import { NEXT_PUBLIC_SERVER_URL } from "@/config";


const Item = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const groupByDocument = signal<boolean>(false)

const Search: React.FC = () => {
  console.log("NEXT_PUBLIC_SERVER_URL", NEXT_PUBLIC_SERVER_URL)
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') || "";
  const [query, setQuery] = useState<string>(searchQuery);
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
  const searchWords = getSearchWords(query);

  const [resultsGrouped, setResultsGrouped] = useState<DocumentSearchResult[]>([]);
  const [resultsChunks, setResultsChunks] = useState<ChunkWithScoreUnion[]>([]);

  const handleSearchGroupedDocuments = async () => {
    try {
      if (!query) return;
      const response = await axios.post<DocumentSearchResult[]>(
        `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks_grouped_by_document`,
        {
          query: query,
          media_types: checkedMediaTypes.value.length > 0 ? checkedMediaTypes.value : null
        }
      );
      setResultsGrouped(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const handleSearchChunks = async () => {
    try {
      if (!query) return;
      const response = await axios.post<ChunkWithScoreUnion[]>(
        `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks`,
        {
          query: query,
          media_types: checkedMediaTypes.value.length > 0 ? checkedMediaTypes.value : null
        }
      );
      setResultsChunks(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const handleSearch = () => {
    if (groupByDocument.value == true) {
      handleSearchGroupedDocuments();
    } else {
      handleSearchChunks();
    }
  }

  useEffect(() => {
    handleSearch()
  }, [groupByDocument.value]);

  return (
    <div className="py-8 flex flex-col gap-4 px-4 md:px-0">
      <Typography variant="h1" gutterBottom>Rechercher des médias</Typography>
      <div className="flex flex-col gap-4">

        <ToggleSwitch
          inputTitle="the-title"
          showCheckedHint={false}
          checked={groupByDocument.value}
          onChange={() => {
            groupByDocument.value = !groupByDocument.value
          }}
          label="Grouper la recherche par document"
          labelPosition="right"
        />


        <SearchBar
          big
          onButtonClick={function noRefCheck() { handleSearch() }}
          renderInput={({ className, id, placeholder, type }) =>
            <input
              ref={setInputElement}
              className={className}
              id={id}
              placeholder={placeholder}
              type={type}
              value={query}
              onChange={event => setQuery(event.currentTarget.value)}
              onKeyDown={event => {
                if (event.key === "Escape") {
                  assert(inputElement !== null);
                  inputElement.blur();
                }
              }}
            />
          }
        />
        <FilterMenu />


      </div>

      {groupByDocument.value == true ? <div>
        {resultsGrouped.length > 0 ?
          <div className="container flex flex-wrap gap-4">
            {resultsGrouped.sort((a, b) => b.max_score - a.max_score).map((result, index) => (
              <DocumentCardWithChunks key={result.document_id} searchResult={result} searchWords={searchWords} />
            ))}
          </div>
          : <p>Aucun résultat trouvé.</p>}
      </div>
        :
        <div>
          {resultsChunks.length > 0 ?
            <div className="container flex flex-wrap gap-4">
              <Masonry columns={2} spacing={2}>
                {resultsChunks.sort((a, b) => b.score - a.score).map((result, index) => (
                  <Item key={index} >
                    <DocumentChunkFull key={result.document.public_path} chunk={result} searchWords={searchWords} />
                  </Item>
                ))}
              </Masonry>
            </div>
            : <p>Aucun résultat trouvé.</p>}
        </div>}
    </div>
  );
};

export default Search;
