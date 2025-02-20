"use client";
import Section1 from '@/components/home/Section1';
import Section3 from '@/components/home/Section3';
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
            <div
                style={{ background: "linear-gradient(135.4deg, #f5f5fe 0%, #e3e3fd 99.31%)" }}
                className="m-0 w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-9 main-content-item mt-24 mb-4">
                    <MainSearch />
                </div>
            </div>

            <Section1 />
            <Section3 />
        </>
    );

}