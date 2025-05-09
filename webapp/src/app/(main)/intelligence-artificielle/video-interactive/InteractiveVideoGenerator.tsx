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
import { useAlertToast } from '@/components/AlertToast';


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
                <h1 className="m-0 h1 text-center">Je crée une vidéo interactive</h1>
                <div className="flex flex-col md:flex-row gap-6 w-full">
                    <Image
                        src="/images/interactive-video-illustration.svg"
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
                    <SIVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onError={onError} onDocumentIdPicked={onDocumentIdPicked} />
                </div>
                <div className={`w-full ${importType === InteractiveVideoImportType.LIEN ? 'block' : 'hidden'}`}>
                    <YoutubeVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onError={onError} onDocumentIdPicked={onDocumentIdPicked} />
                </div>
                <div className={`w-full ${importType === InteractiveVideoImportType.IMPORT ? 'block' : 'hidden'}`}>
                    <ExternalVideoPicker onDocumentProcessingStart={onDocumentProcessingStart} onError={onError} onDocumentIdPicked={onDocumentIdPicked} />
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
            <div className="flex mt-4 w-full">
                <InteractiveVideoHelpMessage hideHowItWorks={!!documentId} />
            </div>

        </div>
    );
}