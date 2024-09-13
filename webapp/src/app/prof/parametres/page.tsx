import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserSettings from "./UserSettings";
import prisma from "@/lib/prisma";

const Settings = async function () {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/');
    }


    const educationLevels = await prisma.educationLevel.findMany();
    const academies = await prisma.academy.findMany();
    const schoolSubjects = await prisma.schoolsSubjects.findMany();

    return <UserSettings educationLevels={educationLevels} academies={academies} schoolSubjects={schoolSubjects}/>


}

export default Settings;