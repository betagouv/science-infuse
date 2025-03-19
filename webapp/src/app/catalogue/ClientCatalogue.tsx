'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ChapterResults } from "@/app/recherche/RenderSearch";
import { EducationLevel, Chapter, Block, Theme } from '@prisma/client';
import { ChapterWithBlock } from '@/types/api';
import Button from '@codegouvfr/react-dsfr/Button';

interface EducationLevelsFiltersProps {
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
    filters: EducationLevel[];
}

const EducationLevelFilters: React.FC<EducationLevelsFiltersProps> = React.memo(({ selectedFilter, onFilterChange, filters }) => {
    return (
        <div className="flex flex-wrap items-center w-full sm:w-fit border-0 border-white p-2 sm:p-4">
            <div className="flex flex-wrap w-full sm:w-auto">
                <Button
                    className="w-full sm:w-auto px-2 sm:px-4 py-2 sm:py-4 m-1 text-xs sm:text-sm"
                    priority={selectedFilter === '' ? 'primary' : 'tertiary no outline'}
                    onClick={() => onFilterChange('')}
                >
                    Tous
                </Button>
                {filters.map((filter) => (
                    <Button
                        key={filter.id}
                        className="w-full sm:w-auto px-2 sm:px-4 py-2 sm:py-4 m-1 text-xs sm:text-sm"
                        priority={selectedFilter === filter.id ? 'primary' : 'tertiary no outline'}
                        onClick={() => onFilterChange(filter.id)}
                    >
                        {filter.name}
                    </Button>
                ))}
            </div>
        </div>
    )
});

interface ThemesFiltersProps {
    selectedFilter: string;
    onFilterChange: (filter: string) => void;
    filters: Theme[];
}

const ThemesFilters: React.FC<ThemesFiltersProps> = React.memo(({ selectedFilter, onFilterChange, filters }) => {
    return (
        <div className="flex flex-wrap items-center w-full sm:w-fit border-0 border-white p-2 sm:p-4">
            <div className="flex flex-wrap w-full sm:w-auto">
                <Button
                    className="w-full sm:w-auto px-2 sm:px-4 py-2 sm:py-4 m-1 text-xs sm:text-sm"
                    priority={selectedFilter === '' ? 'primary' : 'tertiary no outline'}
                    onClick={() => onFilterChange('')}
                >
                    Tous
                </Button>
                {filters.map((filter) => (
                    <Button
                        key={filter.id}
                        className="w-full sm:w-auto px-2 sm:px-4 py-2 sm:py-4 m-1 text-xs sm:text-sm"
                        priority={selectedFilter === filter.id ? 'primary' : 'tertiary no outline'}
                        onClick={() => onFilterChange(filter.id)}
                    >
                        {filter.title}
                    </Button>
                ))}
            </div>
        </div>
    )
});

interface ClientCatalogueProps {
    initialChapters: ChapterWithBlock[];
    filters: EducationLevel[];
    theme: Theme | null;
    allThemes?: Theme[];
}

const filterIcon = <svg
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
        fill="var(--text-action-high-blue-france)"
    />
</svg>;


const ClientCatalogue: React.FC<ClientCatalogueProps> = ({ initialChapters, filters, theme, allThemes }) => {
    const [selectedEducationLevelFilter, setSelectedEducationLevelFilter] = useState<string>('');
    const [selectedThemesFilter, setSelectedThemesFilter] = useState<string>('');
    const [filteredChapters, setFilteredChapters] = useState<ChapterWithBlock[]>(initialChapters);

    const computeFilteredChapters = useCallback(() => {
        let filtered = initialChapters;

        if (selectedEducationLevelFilter !== '') {
            filtered = filtered.filter(c =>
                c.educationLevels.some(el => el.id === selectedEducationLevelFilter)
            );
        }

        if (selectedThemesFilter !== '') {
            filtered = filtered.filter(c =>
                c.theme?.id === selectedThemesFilter
            );
        }

        setFilteredChapters(filtered);
    }, [initialChapters, selectedEducationLevelFilter, selectedThemesFilter]);

    useEffect(() => {
        computeFilteredChapters();
    }, [computeFilteredChapters]);

    return (
        <div className="pb-16 flex flex-col px-4 md:px-0">
            <div className="w-full">
                <h1 className="m-0 text-xl sm:text-2xl md:text-3xl text-center text-black">
                    Catalogue de cours de SVT
                </h1>
            </div>

            {theme && (
                <div className="flex justify-center items-center">
                    <p className="text-lg sm:text-xl md:text-2xl text-center text-black">
                        "{theme.title}" : {initialChapters.length} chapitre{initialChapters.length > 1 ? 's' : ''}
                    </p>
                </div>
            )}

            <div className="flex flex-col w-full mt-8">
                <div className="flex flex-col  w-full sm:w-fit">
                    <div className="flex flex-col sm:flex-row">
                        <div className="flex items-center">
                            {filterIcon}
                            <p className="m-0 w-full sm:w-36 text-xs sm:text-sm font-bold text-[var(--text-action-high-blue-france)]">
                                Niveau scolaire :
                            </p>
                        </div>

                        <EducationLevelFilters
                            selectedFilter={selectedEducationLevelFilter}
                            onFilterChange={setSelectedEducationLevelFilter}
                            filters={filters}
                        />
                    </div>
                    {allThemes && <div className="flex flex-col sm:flex-row">
                        <div className="flex items-center">
                            {filterIcon}
                            <p className="m-0 w-full sm:w-36 text-xs sm:text-sm font-bold text-[var(--text-action-high-blue-france)]">
                                Thème :
                            </p>
                        </div>

                        <ThemesFilters
                            selectedFilter={selectedThemesFilter}
                            onFilterChange={setSelectedThemesFilter}
                            filters={allThemes}
                        />
                    </div>}
                </div>
            </div>

            <div className="flex w-full flex-col mt-16">
                <ChapterResults chapters={filteredChapters} />
            </div>
        </div>
    );
};

export default React.memo(ClientCatalogue);