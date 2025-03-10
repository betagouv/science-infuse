'use client'
import { useEffect, useState } from 'react';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import Input from "@codegouvfr/react-dsfr/Input";
import InteractiveVideoGenerator from "./InteractiveVideoGenerator";


export default function ProfDashboard() {
    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item my-8 gap-8'>
                <Breadcrumb
                    currentPageLabel="Création de vidéo interactive"
                    segments={[
                        {
                            label: 'Accueil',
                            linkProps: {
                                href: '/'
                            }
                        },
                    ]}
                />
                <div className="fr-col-12 fr-col-md-10 main-content-item mb-4 self-center">
                    <InteractiveVideoGenerator />
                </div>
            </div>
        </div>
    )
}