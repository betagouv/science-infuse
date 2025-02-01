'use client'
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';
import { useState } from 'react';

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import Input from "@codegouvfr/react-dsfr/Input";
import Button from "@codegouvfr/react-dsfr/Button";
import { generateInteraciveVideoData } from "@/app/api/export/h5p/contents/interactiveVideo";
import InteractiveVideoGenerator from "@/components/interactifs/InteractiveVideoGenerator";

export default function ProfDashboard() {
    const [youtubeUrl, setYoutubeUrl] = useState('');


    return (
        <div className='w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center'>
            <div className='flex flex-col fr-col-12 fr-col-md-10 main-content-item my-24 gap-8'>
                <Input
                    hintText="Url"
                    label="Vidéo youtube"
                    state="default"
                    stateRelatedMessage="Entrez une url youtube valide"
                    nativeInputProps={{
                        value: youtubeUrl,
                        onChange: (e) => setYoutubeUrl(e.target.value)
                    }}
                />


                <InteractiveVideoGenerator youtubeUrl={youtubeUrl}/>

            </div>
        </div>
    )
}