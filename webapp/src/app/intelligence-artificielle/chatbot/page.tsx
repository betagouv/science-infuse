// src/app/intelligence-artificielle/chatbot/page.tsx
import AutoBreadCrumb from "@/components/AutoBreadCrumb"
import React, { Suspense } from "react"
import { AssistantRuntime } from "./AssistantRuntime"
import dynamic from 'next/dynamic'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ShimmerText from "@/components/ShimmerText";

// Dynamically import ChatBot component with no SSR to prevent hydration issues
const ChatBot = dynamic(() => import('./ChatBot'), {
    ssr: false,
    loading: () => <div className="w-full flex flex-col items-center justify-center p-8">
        <img className="aspect-square w-16 mb-4" src="https://portailpro.gouv.fr/assets/spinner-9a2a6d7a.gif" alt="Chargement" />
        <div className="text-center">
            <p className="text-[1.3rem] font-medium mb-2">
                Chargement du chatbot...
            </p>
        </div>
    </div>

})

export default async function ChatbotPage() {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    const userWithRole = user?.id ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { roles: true }
    }) : null;

    if (!user || !userWithRole || !userWithRole?.roles.includes('BETA_TESTER')) {
        return notFound();
    }

    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4 min-h-screen'>
                <AutoBreadCrumb className='mb-4' />
                <div id="interactive-video-back-portal"></div>
                <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
                    <Suspense fallback={<div className="p-8 text-center">Loading chatbot interface...</div>}>
                        <AssistantRuntime>
                            <ChatBot />
                        </AssistantRuntime>
                    </Suspense>
                </div>
            </div>
        </div>
    )
}