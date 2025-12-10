import Image from 'next/image'
import { useState } from "react";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import styled from '@emotion/styled';
import { useAlertToast } from '@/components/AlertToast';
import { GeneratorLoading, type LoadingMessagesConfig, DocumentSearchPicker } from '../shared/components';
import { TabType } from "@/app/(main)/recherche/Tabs";
import { MediaTypes } from "@/types/vectordb";
import DialogcardEditor from './ImageACompleterEditor';

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

export enum DialogcardImportType {
    RECHERCHE = 'Rechercher dans la bibliothèque',
    IMPORT = 'Importer un document'
}

// Messages de chargement par type d'import
const loadingMessages: LoadingMessagesConfig = {
    [DialogcardImportType.RECHERCHE]: [
        "Analyse du contenu...",
        "Identification des concepts clés...",
        "Génération des dialogcards...",
        "Création de l'interactif..."
    ],
    [DialogcardImportType.IMPORT]: [
        "Importation du document...",
        "Analyse du contenu...",
        "Extraction des informations...",
        "Identification des concepts clés...",
        "Génération des dialogcards...",
        "Création de l'interactif..."
    ]
};

export default () => {
    const [importType, setImportType] = useState<DialogcardImportType>(DialogcardImportType.RECHERCHE);
    const [documentId, setDocumentId] = useState<string>("b5baec40-3e27-41bb-a16e-69a0dea7ee21")
    const [loading, setLoading] = useState(false);
    const alertToast = useAlertToast();

    const onDocumentIdPicked = async (_documentId: string) => {
        window.scrollTo(0, 0);
        setDocumentId(_documentId);
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
                <h1 className="m-0 h1 text-center">Je crée une image à compléter</h1>
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <Image
                        src="/images/interactive-illustration.svg"
                        height={300}
                        width={300}
                        alt="Illustration dialogcards"
                        className="w-[80px] sm:w-[120px] md:w-[160px] lg:w-[200px] h-auto object-contain mix-blend-multiply mx-auto" />
                    <div className="flex flex-col justify-center max-w-2xl flex-1">
                        <p className="text-base text-start text-[#161616] mb-4 sm:mb-6">
                            Créez facilement des images à compléter pour renforcer l'apprentissage en recherchant ou en important un document.
                        </p>
                        <StyledSegControl
                            small
                            className='&_legend]:text-[#161616] w-full [&_.fr-segmented__elements]:w-full' legend="Mon document : "
                            segments={[
                                {
                                    label: DialogcardImportType.RECHERCHE,
                                    nativeInputProps: {
                                        checked: importType === DialogcardImportType.RECHERCHE,
                                        onChange: () => setImportType(DialogcardImportType.RECHERCHE)
                                    }
                                },
                                {
                                    label: DialogcardImportType.IMPORT,
                                    nativeInputProps: {
                                        checked: importType === DialogcardImportType.IMPORT,
                                        onChange: () => setImportType(DialogcardImportType.IMPORT)
                                    }
                                }
                            ]}
                        />
                    </div>
                </div>
            </>}

            {!documentId && !loading && <>
                <div className={`w-full ${importType === DialogcardImportType.RECHERCHE ? 'block' : 'hidden'}`}>
                    <DocumentSearchPicker
                        onDocumentProcessingStart={onDocumentProcessingStart}
                        onError={onError}
                        onDocumentIdPicked={onDocumentIdPicked}
                        config={{
                            searchBarLabel: "Rechercher par mot-clé :",
                            searchBarPlaceholder: "Rechercher un document par mot-clé...",
                            onInsertedLabel: "Générer des dialogcards",
                            mediaTypes: [MediaTypes.PdfImage],
                            hiddenTabs: [TabType.Games, TabType.Chapters, TabType.Documents, TabType.Videos],
                            defaultTab: "documents",
                            queryFilters: {
                                limit: 100,
                                mediaTypes: [MediaTypes.PdfImage]
                            }
                        }}
                    />
                </div>
                <div className={`w-full ${importType === DialogcardImportType.IMPORT ? 'block' : 'hidden'}`}>
                    {/* TODO: Add file upload component */}
                    <p>File upload to be implemented</p>
                </div>
            </>}

            {documentId && <>
                <DialogcardEditor
                    onBackClicked={() => {
                        setDocumentId(undefined)
                        setLoading(false);
                    }}
                    documentId={documentId}
                    onDocumentProcessingEnd={onDocumentProcessingEnd}
                />
            </>}

            {loading && <GeneratorLoading
                title="Création des dialogcards"
                messageType={importType}
                loadingMessages={loadingMessages}
            />}

        </div>
    );
}