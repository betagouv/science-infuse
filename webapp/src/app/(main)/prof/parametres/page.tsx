import { redirect } from "next/navigation";
import UserSettings from "./UserSettings";
import prisma from "@/lib/prisma";
import AutoBreadCrumb from "@/components/AutoBreadCrumb";
import { auth } from "@/auth";

const Settings = async function () {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/');
    }

    const educationLevels = await prisma.educationLevel.findMany();
    const academies = await prisma.academy.findMany();
    const schoolSubjects = await prisma.schoolSubject.findMany();

    return <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center px-4 md:px-0">
        <div className="fr-col-12 mt-8 fr-col-md-10 main-content-item">
            <AutoBreadCrumb />
        </div>
        <div className="fr-col-12 fr-col-md-6 main-content-item mb-24">
            <div className="w-full">
                <h1 className="text-center text-black">
                    Mon compte
                </h1>
            </div>

            <UserSettings educationLevels={educationLevels} academies={academies} schoolSubjects={schoolSubjects} />
        </div>
    </div>


}

export default Settings;