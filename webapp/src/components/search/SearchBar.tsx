'use client';

import SearchBar from "@codegouvfr/react-dsfr/SearchBar"
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import assert from "assert";
import styled from "@emotion/styled";

const StyledSearchBar = styled(SearchBar)`
.fr-btn {
background: black;
}

.fr-search-bar .fr-input {
box-shadow: inset 0 -2px 0 0 var(--border-action-high-blue-france);
}
`

export default () => {
    const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const searchQuery = searchParams.get('query') || "";
    const [query, setQuery] = useState<string>(searchQuery);
    const router = useRouter();

    const handleSearch = () => {
        const current = new URLSearchParams(Array.from(searchParams.entries())); // -> has to use this form

        if (!query) {
            current.delete("query");
        } else {
            current.set("query", query);
        }

        // cast to string
        const search = current.toString();
        // or const searchQuery = `${'?'.repeat(search.length && 1)}${search}`;
        const searchQuery = search ? `?${search}` : "";

        router.push(`/recherche${searchQuery}`);

    };

    return (
        <StyledSearchBar
            className="w-[40rem] max-w-full"
            label="Rechercher une image, une vidéo, un document..."
            onButtonClick={handleSearch}
            renderInput={({ className, id, placeholder, type }) => (
                <input
                    ref={setInputElement}
                    className={className}
                    id={id}
                    placeholder={placeholder}
                    type={type}
                    value={query}
                    onChange={event => setQuery(event.currentTarget.value)}
                    onKeyDown={event => {
                        if (event.key === "Enter") {
                            handleSearch();
                        } else if (event.key === "Escape") {
                            assert(inputElement !== null);
                            inputElement.blur();
                        }
                    }}
                />
            )}
        />
    )
}