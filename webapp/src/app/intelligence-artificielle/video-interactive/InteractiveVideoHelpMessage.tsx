const InteractiveVideoHelpMessage = (props: { hideHowItWorks?: boolean, hideNeedHelp?: boolean }) => {
    return (
        <div className="flex flex-col gap-2 p-8 bg-[#f5f5fe] w-full ">
            {!props.hideHowItWorks && <>
                <p className="text-xl m-0 font-bold text-[#3a3a3a]">
                    Comment ça marche ?
                </p>
                <p className="m-0">
                    <ol>
                        <li>
                            L'intelligence artificielle de Ada analyse votre vidéo et génère automatiquement des questions-réponses, ainsi que des définitions de notions clés abordées dans la vidéo.
                        </li>
                        <li>
                            Personnalisez le contenu selon vos besoins :
                            <ul>
                                <li>modifier les questions et réponses</li>
                                <li>ajuster les définitions</li>
                                <li>définir les moments d'apparition</li>
                            </ul>
                        </li>
                        <li>
                            Prévisualisez et exportez votre vidéo interactive au format H5P, pour une intégration facile dans votre ENT.
                        </li>
                    </ol>
                </p>
            </>}
            {/* {!props.hideNeedHelp && <>
                <p className="text-xl m-0 opacity-20 pointer-events-none font-bold text-[#3a3a3a]">
                    Besoin d'aide ?
                </p>


                <div className="opacity-20 pointer-events-none flex flex-col gap-4">
                    <a href="#" className="w-fit flex items-center gap-2 group">
                        <svg
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.99967 14.6668C4.31767 14.6668 1.33301 11.6822 1.33301 8.00016C1.33301 4.31816 4.31767 1.3335 7.99967 1.3335C11.6817 1.3335 14.6663 4.31816 14.6663 8.00016C14.6663 11.6822 11.6817 14.6668 7.99967 14.6668ZM7.33301 10.0002V11.3335H8.66634V10.0002H7.33301ZM8.66634 8.9035C9.77368 8.56975 10.4698 7.47557 10.3028 6.33114C10.1359 5.18671 9.15622 4.33699 7.99967 4.3335C6.88739 4.33341 5.92959 5.11823 5.71101 6.20883L7.01901 6.47083C7.12225 5.95428 7.60851 5.60639 8.13073 5.67546C8.65295 5.74453 9.03205 6.20687 8.99745 6.7325C8.96286 7.25813 8.52644 7.6668 7.99967 7.66683C7.63148 7.66683 7.33301 7.96531 7.33301 8.3335V9.3335H8.66634V8.9035Z"
                                fill="#000091"
                            />
                        </svg>
                        <span className="text-[#000091] border-b border-[#000091] group-hover:border-transparent inline-block">
                            Tutoriel vidéo de création d'une vidéo interactive avec l'Intelligence Artificielle Ada
                        </span>
                    </a>
                    <a href="#" className="w-fit flex items-center gap-2 group">
                        <svg
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.99967 14.6668C4.31767 14.6668 1.33301 11.6822 1.33301 8.00016C1.33301 4.31816 4.31767 1.3335 7.99967 1.3335C11.6817 1.3335 14.6663 4.31816 14.6663 8.00016C14.6663 11.6822 11.6817 14.6668 7.99967 14.6668ZM7.33301 10.0002V11.3335H8.66634V10.0002H7.33301ZM8.66634 8.9035C9.77368 8.56975 10.4698 7.47557 10.3028 6.33114C10.1359 5.18671 9.15622 4.33699 7.99967 4.3335C6.88739 4.33341 5.92959 5.11823 5.71101 6.20883L7.01901 6.47083C7.12225 5.95428 7.60851 5.60639 8.13073 5.67546C8.65295 5.74453 9.03205 6.20687 8.99745 6.7325C8.96286 7.25813 8.52644 7.6668 7.99967 7.66683C7.63148 7.66683 7.33301 7.96531 7.33301 8.3335V9.3335H8.66634V8.9035Z"
                                fill="#000091"
                            />
                        </svg>
                        <span className="text-[#000091] border-b border-[#000091] group-hover:border-transparent inline-block">
                            Exemples de vidéos interactives co-créées avec Ada
                        </span>
                    </a>
                </div></>
            } */}
        </div>
    )
}

export default InteractiveVideoHelpMessage
