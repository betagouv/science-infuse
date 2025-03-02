import Image from 'next/image'
import Search from "@/app/recherche/page";
import SearchPage from "@/app/recherche/SearchPage";
import { selectedTabType, TabType } from "@/app/recherche/Tabs";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { useEffect, useRef, useState } from "react";
import SIVideoPicker from "./SIVideoPicker";
import ChunkRenderer from "@/app/recherche/DocumentChunkFull";
import { ChunkWithScoreUnion } from "@/types/vectordb";
import ExternalVideoPicker from "./ExternalVideoPicker";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import styled from '@emotion/styled';
import YoutubeVideoPicker from './YoutubeVideoPicker';
import Help from './Help';
import { generateInteraciveVideoData } from '@/app/api/export/h5p/contents/interactiveVideo';
import { useRouter } from 'next/navigation';
import InteractiveVideoEditor from './InteractiveVideoEditor';
import Button from '@codegouvfr/react-dsfr/Button';


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

enum ImportType {
    RECHERCHE = 'Rechercher dans la bibliothèque',
    LIEN = 'Ajouter un lien vidéo',
    IMPORT = 'Importer une vidéo'
}

const Loading = (props: { importType: ImportType }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Messages de chargement par type d'import
    const loadingMessages = {
        [ImportType.RECHERCHE]: [
            "Recherche dans la bibliothèque...",
            "Analyse des contenus disponibles...",
            "Génération des questions...",
            "Création des définitions...",
            "Optimisation des résultats de recherche...",
            "Finalisation des questions et définitions..."
        ],
        [ImportType.LIEN]: [
            "Téléchargement de la vidéo YouTube...",
            "Préparation du contenu vidéo...",
            "Analyse de la voix en cours...",
            "Reconnaissance vocale en cours...",
            "Traitement du texte extrait...",
            "Génération des questions...",
            "Création des définitions...",
            "Finalisation du contenu pédagogique..."
        ],
        [ImportType.IMPORT]: [
            "Importation de la vidéo en cours...",
            "Création du document...",
            "Préparation des données...",
            "Analyse de la voix en cours...",
            "Reconnaissance vocale en cours...",
            "Traitement du texte extrait...",
            "Génération des questions...",
            "Création des définitions...",
            "Finalisation de l'importation..."
        ]
    };

    // Sélection des messages en fonction du type d'import
    const messages = loadingMessages[props.importType];

    useEffect(() => {
        // Fonction pour passer au message suivant avec un délai aléatoire
        const rotateMessage = () => {
            // Délai aléatoire entre 2 et 5 secondes
            const randomDelay = Math.floor(Math.random() * 3000) + 2000;

            const timer = setTimeout(() => {
                setCurrentMessageIndex((prevIndex) =>
                    prevIndex === messages.length - 1 ? 0 : prevIndex + 1
                );
            }, randomDelay);

            // Nettoyage du timer lors du démontage du composant
            return () => clearTimeout(timer);
        };

        // Démarre la rotation des messages
        const cleanup = rotateMessage();
        return cleanup;
    }, [currentMessageIndex, messages.length]);

    return (
        <div className="w-full flex flex-col items-center justify-center p-8">
            <img className="aspect-square w-16 mb-4" src="https://portailpro.gouv.fr/assets/spinner-9a2a6d7a.gif" alt="Chargement" />
            <div className="text-center">
                <p className="text-lg font-medium mb-2">
                    {props.importType}
                </p>
                <p className="text-sm text-gray-600 min-h-8 transition-opacity duration-300">
                    {messages[currentMessageIndex]}
                </p>
            </div>
        </div>
    );
};


export default () => {
    const [importType, setImportType] = useState<ImportType>(ImportType.RECHERCHE);
    const [documentId, setDocumentId] = useState<string>()
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onDocumentIdPicked = async (_documentId: string) => {
        setDocumentId(_documentId);
    }

    const onDocumentProcessingStart = () => {
        setLoading(true);
    }

    const onDocumentProcessingEnd = () => {
        setLoading(false);
    }

    return (
        <div className="flex flex-col w-full gap-8 items-center">
            {!documentId && !loading && <>
                <h1 className="text-5xl m-0 font-bold text-center text-[#161616]">Je crée une vidéo interactive</h1>
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
                    <Image
                        src="/images/interactive-video-illustration.svg"
                        height={300}
                        width={300}
                        alt="Picture of the author"
                        className="w-[100px] sm:w-[150px] md:w-[200px] lg:w-[250px] h-auto object-contain mix-blend-multiply mx-auto" />
                    <div className="flex flex-col justify-center max-w-2xl flex-1">
                        <p className="text-base sm:text-lg md:text-xl text-start text-[#161616] mb-4 sm:mb-6">
                            Créez facilement des quiz et définitions pour enrichir vos vidéos éducatives en recherchant ou en important une vidéo.
                        </p>
                        <StyledSegControl
                            className='&_legend]:text-[#161616] w-full [&_.fr-segmented__elements]:w-full' legend="Ma vidéo : "
                            segments={[
                                {
                                    label: ImportType.RECHERCHE,
                                    nativeInputProps: {
                                        checked: importType === ImportType.RECHERCHE,
                                        onChange: () => setImportType(ImportType.RECHERCHE)
                                    }
                                },
                                {
                                    label: ImportType.LIEN,
                                    nativeInputProps: {
                                        checked: importType === ImportType.LIEN,
                                        onChange: () => setImportType(ImportType.LIEN)
                                    }
                                },
                                {
                                    label: ImportType.IMPORT,
                                    nativeInputProps: {
                                        checked: importType === ImportType.IMPORT,
                                        onChange: () => setImportType(ImportType.IMPORT)
                                    }
                                }
                            ]}
                        />

                    </div>
                </div>
            </>}

            {!documentId && !loading && <>
                <div className={`w-full ${importType === ImportType.RECHERCHE ? 'block' : 'hidden'}`}>
                    <SIVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onDocumentIdPicked={onDocumentIdPicked} />
                </div>
                <div className={`w-full ${importType === ImportType.LIEN ? 'block' : 'hidden'}`}>
                    <YoutubeVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onDocumentIdPicked={onDocumentIdPicked} />
                </div>
                <div className={`w-full ${importType === ImportType.IMPORT ? 'block' : 'hidden'}`}>
                    <ExternalVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onDocumentIdPicked={onDocumentIdPicked} />
                </div>
            </>}
            {loading && <Loading importType={importType} />}

            {documentId && <>
                <Button
                    className='flex justify-center self-start items-center gap-2 xl:absolute xl:translate-x-[calc(-100%-2rem)] translate-x-0 relative'
                    priority='secondary'
                    onClick={() => { setDocumentId(undefined) }}
                >
                    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.21932 4.99999L5.51932 8.29999L4.57665 9.24266L0.333984 4.99999L4.57665 0.757324L5.51932 1.69999L2.21932 4.99999Z" fill="#000091" />
                    </svg>

                    Retour
                </Button>
                <InteractiveVideoEditor documentId={documentId} onDocumentProcessingEnd={onDocumentProcessingEnd} />
            </>}

            <Help hideHowItWorks={!!documentId} />

        </div>
    );
}