'use client';

import React, { Suspense } from "react"
import { AssistantRuntime } from "./AssistantRuntime"
import dynamic from 'next/dynamic'

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

export default function ChatbotClient() {
    return (
        <div className="fr-col-12 fr-col-md-8 main-content-item mb-4 self-center">
            <Suspense fallback={<div className="p-8 text-center">Loading chatbot interface...</div>}>
                <AssistantRuntime>
                    <ChatBot />
                </AssistantRuntime>
            </Suspense>
        </div>
    );
}
