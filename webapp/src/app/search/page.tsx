"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import assert from "assert";
import { Typography } from "@mui/material";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import Highlighter from "react-highlight-words";
import { useSearchParams } from "next/navigation";


interface ChunkWithDistance {
  chunk: string;
  media_type: string;
  media_name: string;
  original_public_path: string;
  start_offset: number;
  end_offset: number;
  distance: number;

}
interface SearchResult {
  document_id: string;
  local_path: string;
  original_public_path: string;
  media_name: string;
  max_distance: number;
  min_distance: number;
  chunks: ChunkWithDistance[];
}

const RenderChunkPreview = ({ chunk, media_type, start_offset, end_offset, distance, query, original_public_path }: ChunkWithDistance & { query: string }) => {
  const [expanded, setExpanded] = useState(false)
  const score = (Number((1 - distance)) * 100).toFixed();
  return (
    <Accordion
      label={<div className="flex max-w-full gap-2 justiy-center items-center whitespace-nowrap overflow-ellipsis">
        <Tag small className=" h-fit" >{score}%</Tag>
        <p className="overflow-ellipsis max-w-full overflow-hidden">{chunk}</p>
      </div>}
      onExpandedChange={(value,) => setExpanded(!value)}
      expanded={expanded}
    >
      <Typography>Passage: </Typography>
      <Highlight>
        <Highlighter
          highlightClassName="YourHighlightClass"
          searchWords={query.split(" ").map(q => q.trim())}
          autoEscape={true}
          textToHighlight={chunk}
        />
      </Highlight>
      <Typography>Media Type: {media_type}</Typography>
      <Typography>Start Offset: {start_offset}</Typography>
      <Typography>End Offset: {end_offset}</Typography>
      <Typography>Source: <a href={`${original_public_path.replace('https://www.youtube.com/watch?v=', 'https://youtu.be/')}?t=${start_offset}`} target="_blank">{original_public_path}</a></Typography>
      <Typography>Distance: {score}</Typography>
    </Accordion>
  );
};



const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') || "";
  const [query, setQuery] = useState<string>(searchQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);

  const handleSearch = async () => {
    try {
      if (!query) return;
      const response = await axios.post<SearchResult[]>(
        "http://localhost:8000/search/query",
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
      <div>
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
      </div>
      <div>
        {results.length > 0 ?
          <div className="container flex flex-wrap gap-4">
            {results.sort((a, b) => a.min_distance - b.min_distance).map((result, index) => (
              <div
                key={index}
                className="flex-auto sm:flex-auto md:flex-auto sm:w-[calc(100%)] md:w-[calc(50%-1rem)]"
              >
                <Card


                  className="grid-item flex flex-col items-center justify-center w-full h-full"
                  title={<a target="_blank" href={result.original_public_path}>
                    <Highlighter
                      highlightClassName="YourHighlightClass"
                      searchWords={query.split(" ").map(q => q.trim())}
                      autoEscape={true}
                      textToHighlight={result.media_name}
                    />
                  </a>
                  }
                  titleAs="h3"
                  desc={<>
                    {result.chunks.sort((a, b) => a.distance - b.distance).map(chunk => <RenderChunkPreview query={query} {...chunk} />)}
                  </>}
                  footer={
                    <button className="fr-btn fr-btn--secondary">Rechercher dans ce document</button>
                  }
                  background
                  border
                  // enlargeLink
                  imageComponent={null}
                  // imageAlt="texte alternatif de l'image"
                  // imageUrl="https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png"
                  linkProps={{
                    href: "#",
                  }}
                  size="medium"
                  start={
                    <ul className="fr-badges-group">
                      <li>
                        {result.max_distance == 0 ? <Badge small severity="success">Exact match</Badge> : <Badge small>Max score: {(Number((1 - result.max_distance)) * 100).toFixed()}%</Badge>}
                      </li>
                      {/* <li>
                        <Badge small>{result.chunks.length} matches</Badge>
                      </li> */}
                      <li>
                        <Badge small>
                          {Array.from(
                            new Set(
                              result.chunks.map((chunk) => chunk.media_type)
                            )
                          ).join(", ")}
                        </Badge>
                      </li>
                    </ul>
                  }
                />
              </div>
            ))}
          </div>
          : <p>No results found.</p>
        }
      </div>
    </div>
  );
};

export default Search;
