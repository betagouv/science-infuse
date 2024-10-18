'use client';

import Button from "@codegouvfr/react-dsfr/Button";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import styled from "@emotion/styled";
import { useSession } from 'next-auth/react';
import { useRef } from 'react';


const videos = [
    { src: "/videos/comment-fonctionner-en-classe-autonome.mp4", srt: "/videos/comment-fonctionner-en-classe-autonome.srt" },
]

const StyledCallout = styled(CallOut)`
    .fr-callout__text {
        display: flex;
        flex-flow: column;
    }
`

const Webinaires = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-container main-content-item">
                <div className="py-16 flex flex-col gap-16 md:px-0">

                    <h1>Webinaires Science Infuse</h1>
                    {user && videos.map(v => (
                        <div key={v.src} className="relative p-8 bg-[#f2f2f2] rounded-xl">
                            <h2>Comment fonctionner en classe autonome?</h2>
                            <video ref={videoRef} controls className="w-full mb-4">
                                <source src={v.src} type="video/mp4" />
                                <track kind="subtitles" src={v.srt} srcLang="fr" label="Français" default />
                                Votre navigateur ne prend pas en charge la balise vidéo.
                            </video>
                            <a href={v.srt} download>Télécharger les sous-titres</a>
                        </div>
                    ))}

                    {!user && (
                        <StyledCallout
                            iconId="ri-information-line"
                            className="flex flex-col [&.fr-callout__text]:flex-col"
                        >
                            <span>
                                Connectez-vous à votre compte Science Infuse pour accéder aux webinaires.
                            </span>
                            <span className="flex flex-row gap-4">
                                <Button priority="secondary"><a href="/">Me connecter</a></Button>
                                <Button><a href="/">Créer un compte</a></Button>
                            </span>
                        </StyledCallout>
                    )}

                </div>
            </div>
        </div>
    )
}

export default Webinaires;