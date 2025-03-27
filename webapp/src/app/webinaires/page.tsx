'use client';

import AutoBreadCrumb from "@/components/AutoBreadCrumb";
import Button from "@codegouvfr/react-dsfr/Button";
import { CallOut } from "@codegouvfr/react-dsfr/CallOut";
import styled from "@emotion/styled";
import { useSession } from 'next-auth/react';
import { useRef } from 'react';


const videos = [
    { title: "Comment fonctionner en classe autonome ?", src: "/videos/comment-fonctionner-en-classe-autonome.mp4", srt: "/videos/comment-fonctionner-en-classe-autonome.srt" },
    { title: "Améliorez l'apprentissage des élèves grâce à la ludification.", src: "/videos/webinaire-ludification-camille.mp4", srt: "/videos/webinaire-ludification-camille.srt" },
    { title: "L'IA au service de vos cours.", src: "/videos/webinaire-ia-erwan.mp4", srt: "/videos/webinaire-ia-erwan.srt" },
    { title: "Enseignements scientifiques et musées : enrichir vos séquences de cours et dynamiser les apprentissages", src: "/videos/webinaire-philippe.mp4", srt: "/videos/webinaire-philippe.srt" },
]



const Webinaires = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4'>
                <AutoBreadCrumb className="mb-4" />
                <div className="flex mb-16 flex-col gap-16 md:px-0">
                    <h1 className="self-center">Webinaires Ada</h1>
                    {videos.map(v => (
                        <div key={v.src} className="relative p-8 bg-[#f2f2f2] rounded-xl">
                            <h2>{v.title}</h2>
                            <video ref={videoRef} controls controlsList="nodownload" className="w-full mb-4">
                                <source src={v.src} type="video/mp4" />
                                <track kind="subtitles" src={v.srt} srcLang="fr" label="Français" default />
                                Votre navigateur ne prend pas en charge la balise vidéo.
                            </video>
                            <a href={v.srt} download>Télécharger les sous-titres</a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Webinaires;