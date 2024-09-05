import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UserSettings from "./UserSettings";
import prisma from "@/lib/prisma";

export default async function () {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/');
    }


    const educationLevels = await prisma.educationLevel.findMany();

    return <UserSettings educationLevels={educationLevels} user={session.user} />


}