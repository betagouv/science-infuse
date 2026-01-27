import { auth } from "@/auth";
import { getUserFull } from "@/lib/utils/db";
import { UserRoles } from "@prisma/client";
import { redirect } from "next/navigation";
import AutoBreadCrumb from "@/components/AutoBreadCrumb";
import ClubAdaClient from "./ClubAdaClient";
import Image from 'next/image';

export default async function ClubAdaPage() {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
        redirect('/');
    }

    const user = await getUserFull(session.user.id);

    if (!user) {
        redirect('/');
    }

    const isBetaTester = user.roles.includes(UserRoles.BETA_TESTER);

    return (
        <div className="fr-container overflow-x-hidden">
            <div className="fr-grid-row fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-10">
                    <div className="mt-8">
                        <AutoBreadCrumb />
                    </div>

                    <div className="w-full flex flex-col items-center gap-8 md:gap-12 px-4 md:px-0 my-16">
                        <div className="relative w-full flex flex-col items-center">
                            <h1 className="m-0 text-[32px] md:text-md font-bold text-center text-[#161616]">
                                Club Ada
                            </h1>
                        </div>
                        <div className="flex flex-col gap-6 max-w-[800px]">
                            <p className="m-0 text-lg md:text-xl text-center text-[#161616] font-medium">
                                Rejoignez le club Ada afin de pouvoir découvrir en exclusivité les nouvelles fonctionnalités de la plateforme !
                            </p>
                            <p className="m-0 text-base md:text-lg text-center text-[#666]">
                                Ce club est gratuit et nous permet de vous présenter en avance les nouvelles fonctionnalités afin d’écouter vos retours !
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-8 w-full">

                            <div className="flex justify-center mt-4">
                                <ClubAdaClient isBetaTester={isBetaTester} userRoles={user.roles} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
