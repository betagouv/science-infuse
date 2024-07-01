"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import assert from "assert";
import { Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { DocumentSearchResult } from "@/types";
import { getSearchWords } from "./text-highlighter";
import DocumentCardWithChunks from "./DocumentCardWithChunks";
import FilterMenu from "./FilterMenu";





const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') || "";
  const [query, setQuery] = useState<string>(searchQuery);
  const [results, setResults] = useState<DocumentSearchResult[]>([]);
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
  const searchWords = getSearchWords(query);

  const handleSearch = async () => {
    try {
      if (!query) return;
      const response = await axios.post<DocumentSearchResult[]>(
        "http://localhost:8000/search/search_chunks_grouped_by_document",
        {
          query: query,
        }
      );
      setResults(response.data);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="py-8 flex flex-col gap-4 px-4 md:px-0">
      <Typography variant="h1" gutterBottom>Rechercher des médias</Typography>
      <div className="flex flex-col gap-4"> 
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
                <FilterMenu/>

      </div>
      <div>
        {results.length > 0 ?
          <div className="container flex flex-wrap gap-4">
            {results.sort((a, b) => b.max_score - a.max_score).map((result, index) => (
              <DocumentCardWithChunks searchResult={result} searchWords={searchWords}/>
            ))}
          </div>
          : <p>Aucun résultat trouvé.</p>        }
      </div>
    </div>
  );
};

export default Search;
