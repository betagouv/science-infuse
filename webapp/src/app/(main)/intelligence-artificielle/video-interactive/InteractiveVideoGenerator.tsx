import Image from 'next/image'
import { useState } from "react";
import ExternalVideoPicker from "./ExternalVideoPicker";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import styled from '@emotion/styled';
import YoutubeVideoPicker from './YoutubeVideoPicker';
import InteractiveVideoHelpMessage from './InteractiveVideoHelpMessage';
import InteractiveVideoEditor from './InteractiveVideoEditor';
import { useAlertToast } from '@/components/AlertToast';
import { GeneratorLoading, type LoadingMessagesConfig, DocumentSearchPicker } from '../shared/components';
import { TabType } from "@/app/(main)/recherche/Tabs";
import { ChunkWithScoreUnion, MediaTypes } from "@/types/vectordb";


const StyledSegControl = styled(SegmentedControl)`
color: #161616;
legend {
    font-weight: bold;
}
.fr-segmented__element {
    width: 100%;
    text-align: center;

    label {
        align-items: center;
        justify-content: center;
    }
}
.fr-segmented__elements {
    width: 100%;
    align-items: center;
    justify-content: space-evenly;
}`;

export enum InteractiveVideoImportType {
    RECHERCHE = 'Rechercher dans la bibliothèque',
    LIEN = 'Ajouter un lien vidéo',
    IMPORT = 'Importer une vidéo'
}

// Messages de chargement par type d'import
const loadingMessages: LoadingMessagesConfig = {
    [InteractiveVideoImportType.RECHERCHE]: [
        "Génération des questions...",
        "Création des définitions...",
        "Création de l'interactif..."
    ],
    [InteractiveVideoImportType.LIEN]: [
        "Téléchargement de la vidéo...",
        "Préparation du contenu vidéo...",
        "Reconnaissance vocale en cours...",
        "Traitement du texte extrait...",
        "Génération des questions...",
        "Création des définitions...",
        "Création de l'interactif..."
    ],
    [InteractiveVideoImportType.IMPORT]: [
        "Importation de la vidéo en cours...",
        "Création du document...",
        "Préparation des données...",
        "Reconnaissance vocale en cours...",
        "Traitement du texte extrait...",
        "Génération des questions...",
        "Création des définitions...",
        "Création de l'interactif..."
    ]
};


export default () => {
    const [importType, setImportType] = useState<InteractiveVideoImportType>(InteractiveVideoImportType.RECHERCHE);
    const [documentId, setDocumentId] = useState<string>()
    const [loading, setLoading] = useState(false);
    const alertToast = useAlertToast();

    const onChunkPicked = async (_chunk: ChunkWithScoreUnion) => {
        window.scrollTo(0, 0);
        setDocumentId(_chunk.document.id);
    }

    const onError = (message: string) => {
        alertToast.error("Erreur", message);
        setLoading(false);
        setDocumentId(undefined);
    }

    const onDocumentProcessingStart = () => {
        setLoading(true);
    }

    const onDocumentProcessingEnd = () => {
        setLoading(false);
    }

    return (
        <div className="flex flex-col w-full gap-4 items-center">

            {!documentId && !loading && <>
                <h1 className="m-0 h1 text-center">Je crée une vidéo interactive</h1>
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <Image
                        src="/images/interactive-illustration.svg"
                        height={300}
                        width={300}
                        alt="Picture of the author"
                        className="w-[80px] sm:w-[120px] md:w-[160px] lg:w-[200px] h-auto object-contain mix-blend-multiply mx-auto" />
                    <div className="flex flex-col justify-center max-w-2xl flex-1">
                        <p className="text-base text-start text-[#161616] mb-4 sm:mb-6">
                            Créez facilement des quiz et définitions pour enrichir vos vidéos éducatives en recherchant ou en important une vidéo.
                        </p>
                        <StyledSegControl
                            small
                            className='&_legend]:text-[#161616] w-full [&_.fr-segmented__elements]:w-full' legend="Ma vidéo : "
                            segments={[
                                {
                                    label: InteractiveVideoImportType.RECHERCHE,
                                    nativeInputProps: {
                                        checked: importType === InteractiveVideoImportType.RECHERCHE,
                                        onChange: () => setImportType(InteractiveVideoImportType.RECHERCHE)
                                    }
                                },
                                {
                                    label: InteractiveVideoImportType.LIEN,
                                    nativeInputProps: {
                                        disabled: true,
                                        checked: importType === InteractiveVideoImportType.LIEN,
                                        onChange: () => setImportType(InteractiveVideoImportType.LIEN)
                                    }
                                },
                                {
                                    label: InteractiveVideoImportType.IMPORT,
                                    nativeInputProps: {
                                        checked: importType === InteractiveVideoImportType.IMPORT,
                                        onChange: () => setImportType(InteractiveVideoImportType.IMPORT)
                                    }
                                }
                            ]}
                        />

                    </div>
                </div>
            </>}

            {!documentId && !loading && <>
                <div className={`w-full ${importType === InteractiveVideoImportType.RECHERCHE ? 'block' : 'hidden'}`}>
                    <DocumentSearchPicker
                        onDocumentProcessingStart={onDocumentProcessingStart}
                        onError={onError}
                        onChunkPicked={onChunkPicked}
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
                </div>
                <div className={`w-full ${importType === InteractiveVideoImportType.LIEN ? 'block' : 'hidden'}`}>
                    <YoutubeVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onError={onError} onChunkPicked={onChunkPicked} />
                </div>
                <div className={`w-full ${importType === InteractiveVideoImportType.IMPORT ? 'block' : 'hidden'}`}>
                    <ExternalVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onError={onError} onChunkPicked={onChunkPicked} />
                </div>
            </>}

            {documentId && <>
                <InteractiveVideoEditor
                    onBackClicked={() => {
                        setDocumentId(undefined)
                        setLoading(false);
                    }}
                    documentId={documentId}
                    onDocumentProcessingEnd={onDocumentProcessingEnd}
                />
            </>}
            {loading && <GeneratorLoading
                title="Création de la vidéo interactive"
                messageType={importType}
                loadingMessages={loadingMessages}
            />}
            <div className="flex mt-4 w-full">
                <InteractiveVideoHelpMessage hideHowItWorks={!!documentId} />
            </div>

        </div>
    );
}