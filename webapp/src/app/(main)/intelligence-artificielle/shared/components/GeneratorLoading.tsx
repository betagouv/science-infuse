import { useEffect, useState } from "react";
import ShimmerText from '@/components/ShimmerText';

export type LoadingMessagesConfig = {
    [key: string]: string[];
};

export type GeneratorLoadingProps = {
    title: string;
    messageType: string;
    loadingMessages: LoadingMessagesConfig;
};

export const GeneratorLoading = (props: GeneratorLoadingProps) => {
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // Sélection des messages en fonction du type
    const messages = props.loadingMessages[props.messageType] || [];

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
                    {props.title}
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