"use client";
import Section1 from '@/components/home/Section1';
import Section2 from '@/components/home/Section2';
import Section3 from '@/components/home/Section3';
import Login from '@/components/Login';
import MainSearch from '@/components/search/MainSearch';
import { Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Page() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <>
            <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
                {user ?
                    <div className="fr-col-12 fr-col-md-8 main-content-item my-24">
                        <MainSearch />
                    </div> :
                    <div className="fr-col-12 fr-col-md-4 main-content-item my-24">
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