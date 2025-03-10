import Image from 'next/image'
import { useEffect, useState } from "react";
import SIVideoPicker from "./SIVideoPicker";
import ExternalVideoPicker from "./ExternalVideoPicker";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import styled from '@emotion/styled';
import YoutubeVideoPicker from './YoutubeVideoPicker';
import InteractiveVideoHelpMessage from './InteractiveVideoHelpMessage';
import { useRouter } from 'next/navigation';
import InteractiveVideoEditor from './InteractiveVideoEditor';
import Button from '@codegouvfr/react-dsfr/Button';
import ShimmerText from '@/components/ShimmerText';


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

export const InteractiveVideoGeneratorLoading = (props: { importType: InteractiveVideoImportType }) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Messages de chargement par type d'import
    const loadingMessages = {
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
                <p className="text-[1.3rem] font-medium mb-2">
                    Création de la vidéo interactive
                </p>
                <ShimmerText
                    className="text-[1.1rem] font-thin min-h-8"
                    text={messages[currentMessageIndex]}
                    gradientColors="from-gray-600 via-gray-300 to-gray-600"
                />
            </div>
        </div>
    );
};


export default () => {
    const [importType, setImportType] = useState<InteractiveVideoImportType>(InteractiveVideoImportType.RECHERCHE);
    const [documentId, setDocumentId] = useState<string>()
    const [loading, setLoading] = useState(false);

    const onDocumentIdPicked = async (_documentId: string) => {
        window.scrollTo(0, 0);
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
                <h1 className="text-3xl sm:text-5xl m-0 font-bold text-center text-[#161616]">Je crée une vidéo interactive</h1>
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
                                    label: InteractiveVideoImportType.RECHERCHE,
                                    nativeInputProps: {
                                        checked: importType === InteractiveVideoImportType.RECHERCHE,
                                        onChange: () => setImportType(InteractiveVideoImportType.RECHERCHE)
                                    }
                                },
                                {
                                    label: InteractiveVideoImportType.LIEN,
                                    nativeInputProps: {
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
                    <SIVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onDocumentIdPicked={onDocumentIdPicked} />
                </div>
                <div className={`w-full ${importType === InteractiveVideoImportType.LIEN ? 'block' : 'hidden'}`}>
                    <YoutubeVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onDocumentIdPicked={onDocumentIdPicked} />
                </div>
                <div className={`w-full ${importType === InteractiveVideoImportType.IMPORT ? 'block' : 'hidden'}`}>
                    <ExternalVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onDocumentIdPicked={onDocumentIdPicked} />
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
            {loading && <InteractiveVideoGeneratorLoading importType={importType} />}

            <hr className='w-full' />

            <InteractiveVideoHelpMessage hideHowItWorks={!!documentId} />

        </div>
    );
}