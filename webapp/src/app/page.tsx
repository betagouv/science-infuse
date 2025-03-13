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
            <MainSearch />
            <Section1 />
            <Section3 />
        </>
    );

}