'use client';

import SearchBar from "@codegouvfr/react-dsfr/SearchBar"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import styled from "@emotion/styled";
import useWindowSize from "@/course_editor/hooks/useWindowSize";


export default (props: { className?: string, autoFocus?: boolean, onSearchBarEmpty?: () => void, handleSearch?: (query: string) => void }) => {
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
    
    const {isTablet} = useWindowSize();

    if (!isMounted) {
        return null;
    }


    return (
        <SearchBar
            className={`w-full max-w-full ${props.className}`}
            label="tectonique des plaques, volcan, climat..."
            onButtonClick={handleSearch}
            renderInput={({ className, id, placeholder, type }) => (
                <input
                    ref={inputRef}
                    className={`${className} bg-white`}
                    id={id}
                    placeholder={placeholder}
                    type={type}
                    value={query}
                    onChange={event => {
                        const value = event.currentTarget.value;
                        setQuery(value)
                        if (value == "" && props?.onSearchBarEmpty) {
                            props.onSearchBarEmpty();
                        } 
                    }}
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