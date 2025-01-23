import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import RenderH5pContents from "./RenderH5pContents";

async function getContents() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const contents = await prisma.h5PContent.findMany({
            where: {
                userId
            },
            include: {
                documents: true,
            }
        });
        return contents;
    } catch (error) {
        console.error('Failed to fetch contents:', error);
        throw new Error('Failed to fetch contents');
    }
}



export default async function MesInteractifs() {
    const contents = await getContents();

    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 fr-container main-content-item">
                <div className="py-16 flex flex-col gap-8 md:px-0">
                    <div className="w-full">
                        <h1 className="m-0 text-3xl md:text-4xl font-bold text-center text-black">
                            Mes intéractifs
                        </h1>
                    </div>
                    <RenderH5pContents contents={contents} />
                </div>
            </div>
        </div>
    );
}