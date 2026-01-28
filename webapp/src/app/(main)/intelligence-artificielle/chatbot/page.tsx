// src/app/intelligence-artificielle/chatbot/page.tsx
import AutoBreadCrumb from "@/components/AutoBreadCrumb"
import { checkBetaAccess } from "@/lib/betaAccessControl";
import ChatbotClient from "./ChatbotClient";

export default async function ChatbotPage() {
    // Check beta access - will redirect to /prof/club-ada if not allowed
    await checkBetaAccess('/intelligence-artificielle/chatbot');

    return (
        <div className='w-full fr-grid-row fr-grid-row--center'>
            <div className='flex flex-col fr-container main-content-item mt-4 min-h-screen'>
                <AutoBreadCrumb className='mb-4' />
                <div id="interactive-video-back-portal"></div>
                <ChatbotClient />
            </div>
        </div>
    )
}
