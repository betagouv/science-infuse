import Image from 'next/image'
import { useState } from "react";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import styled from '@emotion/styled';
import { useAlertToast } from '@/components/AlertToast';
import { GeneratorLoading, type LoadingMessagesConfig, DocumentSearchPicker } from '../shared/components';
import { DirectFileDocumentPicker } from '../shared/components';
import { TabType } from "@/app/(main)/recherche/Tabs";
import { ChunkWithScoreUnion, MediaTypes } from "@/types/vectordb";
import QuizzEditor from './QuizzEditor';

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

export enum QuizzImportType {
    RECHERCHE = 'Rechercher dans la bibliothèque',
    IMPORT = 'Importer un document'
}

// Messages de chargement par type d'import
const loadingMessages: LoadingMessagesConfig = {
    [QuizzImportType.RECHERCHE]: [
        "Analyse du contenu...",
        "Identification des concepts clés...",
        "Génération des questions de quiz...",
        "Création de l'interactif..."
    ],
    [QuizzImportType.IMPORT]: [
        "Importation du document...",
        "Analyse du contenu...",
        "Extraction des informations...",
        "Identification des concepts clés...",
        "Génération des questions de quiz...",
        "Création de l'interactif..."
    ]
};

export default () => {
    const [importType, setImportType] = useState<QuizzImportType>(QuizzImportType.RECHERCHE);
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
                <h1 className="m-0 h1 text-center">Je crée des quiz</h1>
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <Image
                        src="/images/interactive-illustration.svg"
                        height={300}
                        width={300}
                        alt="Illustration quiz"
                        className="w-[80px] sm:w-[120px] md:w-[160px] lg:w-[200px] h-auto object-contain mix-blend-multiply mx-auto" />
                    <div className="flex flex-col justify-center max-w-2xl flex-1">
                        <p className="text-base text-start text-[#161616] mb-4 sm:mb-6">
                            Créez facilement des quiz interactifs pour renforcer l'apprentissage en recherchant ou en important un document.
                        </p>
                        <StyledSegControl
                            small
                            className='&_legend]:text-[#161616] w-full [&_.fr-segmented__elements]:w-full' legend="Mon document : "
                            segments={[
                                {
                                    label: QuizzImportType.RECHERCHE,
                                    nativeInputProps: {
                                        checked: importType === QuizzImportType.RECHERCHE,
                                        onChange: () => setImportType(QuizzImportType.RECHERCHE)
                                    }
                                },
                                {
                                    label: QuizzImportType.IMPORT,
                                    nativeInputProps: {
                                        checked: importType === QuizzImportType.IMPORT,
                                        onChange: () => setImportType(QuizzImportType.IMPORT)
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>
            </>}

            {!documentId && !loading && <>
                <div className={`w-full ${importType === QuizzImportType.RECHERCHE ? 'block' : 'hidden'}`}>
                    <DocumentSearchPicker
                        onDocumentProcessingStart={onDocumentProcessingStart}
                        onError={onError}
                        onChunkPicked={onChunkPicked}
                        config={{
                            searchBarLabel: "Rechercher par mot-clé :",
                            searchBarPlaceholder: "Rechercher un document par mot-clé...",
                            onInsertedLabel: "Générer des quiz",
                            mediaTypes: [MediaTypes.PdfText, MediaTypes.VideoTranscript, MediaTypes.Website],
                            hiddenTabs: [TabType.Games, TabType.Pictures],
                            defaultTab: "documents",
                            queryFilters: {
                                limit: 100,
                                mediaTypes: [MediaTypes.PdfText, MediaTypes.VideoTranscript, MediaTypes.Website]
                            }
                        }}
                    />
                </div>
                <div className={`w-full ${importType === QuizzImportType.IMPORT ? 'block' : 'hidden'}`}>
                    <DirectFileDocumentPicker
                        accept={{
                            'application/pdf': ['.pdf'],
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/png': ['.png'],
                        }}
                        hintText="Formats supportés : PDF, JPG, PNG."
                        submitLabel="Générer des quiz"
                        onDocumentProcessingStart={onDocumentProcessingStart}
                        onError={onError}
                        onChunkPicked={onChunkPicked}
                    />
                </div>
            </>}

            {documentId && <>
                <QuizzEditor
                    onBackClicked={() => {
                        setDocumentId(undefined)
                        setLoading(false);
                    }}
                    documentId={documentId}
                    onDocumentProcessingEnd={onDocumentProcessingEnd}
                />
            </>}

            {loading && <GeneratorLoading
                title="Création des quiz"
                messageType={importType}
                loadingMessages={loadingMessages}
            />}

        </div>
    );
}
