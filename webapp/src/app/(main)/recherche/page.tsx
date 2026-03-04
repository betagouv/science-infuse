"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { selectedTabType } from "./Tabs";
import Snackbar from "@/course_editor/components/Snackbar";
import SearchPage from "./SearchPage";



const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || "";
  const urlTabType = searchParams.get('tab') || "";
  const { push } = useRouter();


  return (
    <div className="w-full fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-container main-content-item">
        <div className="py-16 flex flex-col gap-8 md:px-0">
          <SearchHeader query={query} />
          <SearchPage query={query} tab={urlTabType} onTabChange={(newTab) => {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', newTab);
            push(url.toString());
            selectedTabType.value = newTab;
          }} />
        </div>
      </div>
      <Snackbar />
    </div>
  );
};

const SearchHeader: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center text-center px-4 sm:px-0">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
      Résultats de la recherche
    </h1>
    <p className="text-lg sm:text-xl text-black">"{query}"</p>
  </div>
);


export default Search;