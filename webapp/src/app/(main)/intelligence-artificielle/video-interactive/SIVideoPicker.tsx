import { TabType } from "@/app/(main)/recherche/Tabs";
import { MediaTypes } from "@/types/vectordb";
import { DocumentPickerProps } from "../shared/types";
import { DocumentSearchPicker } from "../shared/components";

export default (props: DocumentPickerProps) => {
    return <DocumentSearchPicker
        {...props}
        config={{
            searchBarLabel: "Rechercher par mot-clé :",
            searchBarPlaceholder: "Rechercher une vidéo par mot-clé...",
            onInsertedLabel: "Générer quiz et définitions",
            mediaTypes: [MediaTypes.VideoTranscript],
            hiddenTabs: [TabType.Chapters, TabType.Documents, TabType.Games, TabType.Others, TabType.Pictures],
            defaultTab: "videos",
            queryFilters: {
                limit: 100,
                mediaTypes: [MediaTypes.VideoTranscript],
                maxDuration: 600
            }
        }}
    />
}