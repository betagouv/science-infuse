import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import RenderH5pContents from "./RenderH5pContents";
import { H5PContent } from "@prisma/client";
import { DocumentWithChunks } from "@/types/vectordb";
import RegisteredUserFeature from "@/components/RegisteredUserFeature";

async function getContents(userId: string) {
    try {

        const contents = await prisma.h5PContent.findMany({
            where: {
                userId
            },
            include: {
                documents: {
                    include: {
                        tags: true,
                        documentChunks: {
                            include: {
                                metadata: true,
                                document: true,
                            }
                        }
                    }
                },
            }
        });

        const formattedContents = contents.map(content => ({
            ...content,
            documents: content.documents.map(doc => ({
                ...doc,
                chunks: doc.documentChunks
            }))
        }));

        return formattedContents as (H5PContent & { documents: DocumentWithChunks[] })[];
    } catch (error) {
        console.error('Failed to fetch contents:', error);
        throw new Error('Failed to fetch contents');
    }
}


export default async function MesInteractifs() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId)
        return <div className="fr-col-12 fr-container main-content-item py-4">
            <RegisteredUserFeature />
        </div>

    const contents = await getContents(userId);

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