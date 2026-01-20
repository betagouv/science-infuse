import Image from 'next/image'
import { useState } from "react";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import styled from '@emotion/styled';
import { useAlertToast } from '@/components/AlertToast';
import { GeneratorLoading, type LoadingMessagesConfig, DocumentSearchPicker } from '../shared/components';
import { DirectFileDocumentPicker } from '../shared/components';
import { TabType } from "@/app/(main)/recherche/Tabs";
import { ChunkWithScoreUnion, MediaTypes } from "@/types/vectordb";
import MotsCroisesEditor from './MotsCroisesEditor';

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

export enum MotsCroisesImportType {
    RECHERCHE = 'Rechercher dans la bibliothèque',
    IMPORT = 'Importer un document'
}

// Messages de chargement par type d'import
const loadingMessages: LoadingMessagesConfig = {
    [MotsCroisesImportType.RECHERCHE]: [
        "Analyse du contenu...",
        "Identification des concepts clés...",
        "Génération des mots croisés...",
        "Création de l'interactif..."
    ],
    [MotsCroisesImportType.IMPORT]: [
        "Importation du document...",
        "Analyse du contenu...",
        "Extraction des informations...",
        "Identification des concepts clés...",
        "Génération des mots croisés...",
        "Création de l'interactif..."
    ]
};

export default () => {
    const [importType, setImportType] = useState<MotsCroisesImportType>(MotsCroisesImportType.RECHERCHE);
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
                <h1 className="m-0 h1 text-center">Je crée des mots croisés</h1>
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <Image
                        src="/images/interactive-illustration.svg"
                        height={300}
                        width={300}
                        alt="Illustration mots croisés"
                        className="w-[80px] sm:w-[120px] md:w-[160px] lg:w-[200px] h-auto object-contain mix-blend-multiply mx-auto" />
                    <div className="flex flex-col justify-center max-w-2xl flex-1">
                        <p className="text-base text-start text-[#161616] mb-4 sm:mb-6">
                            Créez facilement des mots croisés pour renforcer l'apprentissage en recherchant ou en important un document.
                        </p>
                        <StyledSegControl
                            small
                            className='&_legend]:text-[#161616] w-full [&_.fr-segmented__elements]:w-full' legend="Mon document : "
                            segments={[
                                {
                                    label: MotsCroisesImportType.RECHERCHE,
                                    nativeInputProps: {
                                        checked: importType === MotsCroisesImportType.RECHERCHE,
                                        onChange: () => setImportType(MotsCroisesImportType.RECHERCHE)
                                    }
                                },
                                {
                                    label: MotsCroisesImportType.IMPORT,
                                    nativeInputProps: {
                                        checked: importType === MotsCroisesImportType.IMPORT,
                                        onChange: () => setImportType(MotsCroisesImportType.IMPORT)
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>
            </>}

            {!documentId && !loading && <>
                <div className={`w-full ${importType === MotsCroisesImportType.RECHERCHE ? 'block' : 'hidden'}`}>
                    <DocumentSearchPicker
                        onDocumentProcessingStart={onDocumentProcessingStart}
                        onError={onError}
                        onChunkPicked={onChunkPicked}
                        config={{
                            searchBarLabel: "Rechercher par mot-clé :",
                            searchBarPlaceholder: "Rechercher un document par mot-clé...",
                            onInsertedLabel: "Générer des mots croisés",
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
                <div className={`w-full ${importType === MotsCroisesImportType.IMPORT ? 'block' : 'hidden'}`}>
                    <DirectFileDocumentPicker
                        accept={{
                            'application/pdf': ['.pdf'],
                            'image/jpeg': ['.jpg', '.jpeg'],
                            'image/png': ['.png'],
                        }}
                        hintText="Formats supportés : PDF, JPG, PNG."
                        submitLabel="Générer des mots croisés"
                        onDocumentProcessingStart={onDocumentProcessingStart}
                        onError={onError}
                        onChunkPicked={onChunkPicked}
                    />
                </div>
            </>}

            {documentId && <>
                <MotsCroisesEditor
                    onBackClicked={() => {
                        setDocumentId(undefined)
                        setLoading(false);
                    }}
                    documentId={documentId}
                    onDocumentProcessingEnd={onDocumentProcessingEnd}
                />
            </>}

            {loading && <GeneratorLoading
                title="Création des mots croisés"
                messageType={importType}
                loadingMessages={loadingMessages}
            />}

        </div>
    );
}
