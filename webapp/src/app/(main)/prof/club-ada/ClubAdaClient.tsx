'use client';

import { apiClient } from "@/lib/api-client";
import Button from "@codegouvfr/react-dsfr/Button";
import { UserRoles } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSnackbar } from "@/app/SnackBarProvider";
import { SparklesIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

export default function ClubAdaClient({ isBetaTester, userRoles }: { isBetaTester: boolean, userRoles: UserRoles[] }) {
    const [loading, setLoading] = useState(false);
    const [requested, setRequested] = useState(false);
    const router = useRouter();
    const { showSnackbar } = useSnackbar();

    const handleJoin = async () => {
        setLoading(true);
        try {
            await apiClient.updateUser({ requestedClubAda: true } as any);
            showSnackbar(<p className="m-0">Votre demande a été envoyée !</p>, 'success');
            setRequested(true);
            router.refresh();
        } catch (error) {
            showSnackbar(<p className="m-0">Une erreur est survenue.</p>, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (isBetaTester) {
        return (
            <div className="fr-card fr-p-6v bg-[#f5f5fe] border border-[#e3e3fd] rounded-lg">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#e3e3fd]">
                        <SparklesIcon size={32} className="text-[#000091]" />
                    </div>
                    <div>
                        <p className="m-0 font-bold text-[#000091] text-lg mb-2">Vous êtes membre du Club Ada !</p>
                        <p className="m-0 text-[#666]">Merci pour votre participation et vos retours précieux.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (requested) {
        return (
            <div className="fr-card fr-p-6v bg-[#f5f5fe] border border-[#e3e3fd] rounded-lg">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#e3e3fd]">
                        <ClockIcon size={32} className="text-[#000091]" />
                    </div>
                    <div>
                        <p className="m-0 font-bold text-[#000091] text-lg mb-2">Demande envoyée !</p>
                        <p className="m-0 text-[#666]">Un administrateur va examiner votre demande prochainement.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Button 
            onClick={handleJoin} 
            disabled={loading}
            priority="primary"
            size="large"
            className="!bg-[#000091] hover:!bg-[#1212ff]"
        >
            {loading ? "Chargement..." : "Je rejoins l'aventure Ada !"}
        </Button>
    );
}
