'use client';

import React, { useState } from 'react';
import { ChapterResults } from "@/app/recherche/RenderSearch";
import { EducationLevel, Chapter, Block, Theme } from '@prisma/client';
import { ChapterWithBlock } from '@/lib/api-client';

interface FiltersProps {
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
    filters: EducationLevel[];
}

const Filters: React.FC<FiltersProps> = ({ selectedFilter, onFilterChange, filters }) => {
    return (
        <div className="flex flex-wrap justify-center items-center w-full border-0 border-white p-4">
            <div className="flex items-center mr-4">
                <svg
                    width={17}
                    height={16}
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4 mr-2"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M4.6135 12.0001C4.75123 11.6097 5.00666 11.2717 5.34456 11.0326C5.68247 10.7935 6.08622 10.6651 6.50016 10.6651C6.9141 10.6651 7.31786 10.7935 7.65576 11.0326C7.99367 11.2717 8.24909 11.6097 8.38683 12.0001H15.1668V13.3334H8.38683C8.24909 13.7238 7.99367 14.0618 7.65576 14.3009C7.31786 14.54 6.9141 14.6684 6.50016 14.6684C6.08622 14.6684 5.68247 14.54 5.34456 14.3009C5.00666 14.0618 4.75123 13.7238 4.6135 13.3334H1.8335V12.0001H4.6135ZM8.6135 7.33342C8.75123 6.94307 9.00666 6.60504 9.34456 6.36595C9.68247 6.12685 10.0862 5.99845 10.5002 5.99845C10.9141 5.99845 11.3179 6.12685 11.6558 6.36595C11.9937 6.60504 12.2491 6.94307 12.3868 7.33342H15.1668V8.66675H12.3868C12.2491 9.05711 11.9937 9.39513 11.6558 9.63423C11.3179 9.87332 10.9141 10.0017 10.5002 10.0017C10.0862 10.0017 9.68247 9.87332 9.34456 9.63423C9.00666 9.39513 8.75123 9.05711 8.6135 8.66675H1.8335V7.33342H8.6135ZM4.6135 2.66675C4.75123 2.2764 5.00666 1.93838 5.34456 1.69928C5.68247 1.46018 6.08622 1.33179 6.50016 1.33179C6.9141 1.33179 7.31786 1.46018 7.65576 1.69928C7.99367 1.93838 8.24909 2.2764 8.38683 2.66675H15.1668V4.00009H8.38683C8.24909 4.39044 7.99367 4.72847 7.65576 4.96756C7.31786 5.20666 6.9141 5.33505 6.50016 5.33505C6.08622 5.33505 5.68247 5.20666 5.34456 4.96756C5.00666 4.72847 4.75123 4.39044 4.6135 4.00009H1.8335V2.66675H4.6135Z"
                        fill="#3A3A3A"
                    />
                </svg>
                <p className="m-0 text-sm font-bold text-[#3a3a3a]">
                    Filtres :
                </p>
            </div>
            <div className="flex flex-wrap">
                <button
                    className={`px-4 py-[1.5rem] m-0 text-sm hover:text-black ${selectedFilter === ''
                        ? 'bg-black text-white'
                        : 'bg-white text-[#161616] hover:bg-gray-100'
                        }`}
                    onClick={() => onFilterChange('')}
                >
                    Tous
                </button>
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        className={`px-4 py-[1.5rem] m-0 text-sm hover:text-black ${selectedFilter === filter.id
                            ? 'bg-black text-white'
                            : 'bg-white text-[#161616] hover:bg-gray-100'
                            }`}
                        onClick={() => onFilterChange(filter.id)}
                    >
                        {filter.name}
                    </button>
                ))}
            </div>
        </div>
    )
}

interface ClientCatalogueProps {
    initialChapters: ChapterWithBlock[];
    filters: EducationLevel[];
    theme?: Theme
}

const ClientCatalogue: React.FC<ClientCatalogueProps> = ({ initialChapters, filters, theme }) => {
    const [selectedFilter, setSelectedFilter] = useState<string>('');
    const [filteredChapters, setFilteredChapters] = useState<ChapterWithBlock[]>(initialChapters);

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        if (filter === '') {
            setFilteredChapters(initialChapters);
        } else {
            setFilteredChapters(initialChapters.filter(c => c.educationLevels.some(el => el.id === filter)));
        }
    }

    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-container main-content-item">
                <div className="py-16 flex flex-col gap-8 md:px-0">

                    <div className="w-full">
                        <h1 className="m-0 text-3xl md:text-4xl font-bold text-center text-black">
                            Catalogue de cours de SVT
                        </h1>
                    </div>

                    <div className="flex justify-center items-center">
                        <p className="text-xl md:text-2xl text-center text-black">
                            "{theme?.title}" : {initialChapters.length} chapitre{initialChapters.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    <Filters selectedFilter={selectedFilter} onFilterChange={handleFilterChange} filters={filters} />
                    <ChapterResults chapters={filteredChapters} />
                </div>
            </div>
        </div>
    )
}

export default ClientCatalogue;