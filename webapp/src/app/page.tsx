"use client";
import Section1 from '@/components/home/Section1';
import Section2 from '@/components/home/Section2';
import Section3 from '@/components/home/Section3';
import Login from '@/components/Login';
import MobileNotSupportedModal from '@/components/MobileNotSupportedModal';
import MainSearch from '@/components/search/MainSearch';
import { useSession } from 'next-auth/react';
import React from 'react';

export default function Page() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <>
            <MobileNotSupportedModal />
            <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
                {user ?
                    <div className="fr-col-12 fr-col-md-8 main-content-item my-24">
                        <MainSearch />
                    </div> :
                    <div className="fr-col-12 fr-col-md-6 fr-col-lg-4 main-content-item my-16">
                        <Login />
                    </div>
                }
            </div>
            <Section1 />
            {!user && <Section2 />}
            <Section3 reverse={!!user} />
        </>
    );

}