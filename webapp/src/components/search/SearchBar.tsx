'use client';

import SearchBar from "@codegouvfr/react-dsfr/SearchBar"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";

const StyledSearchBar = styled(SearchBar)`
  .fr-btn {
    background: black;
  }

  .fr-search-bar .fr-input {
    box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
  }
`

export default (props: { autoFocus?: boolean, handleSearch?: (query: string) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const searchQuery = searchParams.get('query') || "";
    const [query, setQuery] = useState<string>(searchQuery);
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (props.autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [props.autoFocus]);

    const handleSearch = () => {
        if (props.handleSearch) {
            props.handleSearch(query);
            return;
        }

        const current = new URLSearchParams(Array.from(searchParams.entries()));

        if (!query) {
            current.delete("query");
        } else {
            current.set("query", query);
        }

        const search = current.toString();
        const searchQuery = search ? `?${search}` : "";

        router.push(`/recherche${searchQuery}`);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <StyledSearchBar
            className="w-[40rem] max-w-full"
            label="Rechercher une image, une vidéo, un document..."
            onButtonClick={handleSearch}
            renderInput={({ className, id, placeholder, type }) => (
                <input
                    ref={inputRef}
                    className={className}
                    id={id}
                    placeholder={placeholder}
                    type={type}
                    value={query}
                    onChange={event => setQuery(event.currentTarget.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            handleSearch();
                        } else if (event.key === "Escape" && inputRef.current) {
                            inputRef.current.blur();
                        }
                    }}
                />
            )}
        />
    )
}