export const removeDiacritics = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const escapeRegExp = (text: string) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// Custom function to handle chunk finding with normalization
export const findNormalizedChunks = (data: any) => {

    const normalizedText = removeDiacritics(data.textToHighlight);
    let chunks: any[] = [];
    data.searchWords.forEach((word: string) => {
        if (!word.trim()) return; // Skip empty or whitespace-only words

        const escapedWord = escapeRegExp(word.trim()); // Escape special characters
        const regex = new RegExp(escapedWord, 'gi');
        let match;
        while ((match = regex.exec(normalizedText)) != null) {
            const start = match.index;
            const end = regex.lastIndex;
            // Ensure we do not re-find the same zero-length match
            if (end === start) {
                regex.lastIndex = start + 1; // Move past this index
            }
            // Check if this match is already covered by a previously found chunk

            if (!chunks.find(c => c.start <= start && c.end >= end)) {
                chunks.push({ start, end });
            }
        }
    });

    // Return chunks sorted by start position
    return chunks.sort((a, b) => a.start - b.start);

};


export const getSearchWords = (query: string) => query.split(" ").map(q => q.trim()).filter(word => word.length > 2)
