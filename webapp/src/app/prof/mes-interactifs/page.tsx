import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import RenderH5pContents from "./RenderH5pContents";
import { H5PContent } from "@prisma/client";
import { DocumentWithChunks } from "@/types/vectordb";
import RegisteredUserFeature from "@/components/RegisteredUserFeature";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Button from "@codegouvfr/react-dsfr/Button";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import AutoBreadCrumb from "@/components/AutoBreadCrumb";

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

async function deleteContent(contentId: string, userId: string) {
    console.log("DELETECONTENT", contentId, userId)
    try {
        const content = await prisma.h5PContent.findFirst({
            where: { h5pId: contentId }
        });

        if (!content) {
            throw new Error('Content not found');
        }

        if (content.userId !== userId) {
            throw new Error('Unauthorized: You can only delete your own content');
        }

        await prisma.h5PContent.delete({
            where: { id: content.id }
        });

        revalidatePath('/prof/mes-interactifs');
        return true;
    } catch (error) {
        console.error('Failed to delete content:', error);
        throw error;
    }
}


export default async function MesInteractifs() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId)
        return <div className="fr-col-12 fr-container main-content-item py-4">
            <RegisteredUserFeature />
        </div>

    const deleteH5p = async (contentId: string) => {
        "use server"
        await deleteContent(contentId, userId);
    }
    const contents = await getContents(userId);
    const sortedContents = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return (
        <div className="w-full fr-grid-row fr-grid-row--center">
            <div className="fr-col-12 mt-8 fr-container main-content-item">
                <AutoBreadCrumb />
                <div className="pb-16 flex flex-col gap-8 md:px-0">
                    <div className="w-full">
                        <h1 className="text-center text-black">
                            Mes interactifs
                        </h1>
                    </div>
                    {contents.length > 0 ? (
                        <RenderH5pContents deleteH5p={deleteH5p} contents={sortedContents} />
                    ) : (
                        <CallOut iconId="ri-information-line" title="Vous n'avez pas encore généré d'interactifs.">
                            <div className="flex flex-col gap-4">
                                <p className="mt-8">
                                    Les interactifs que vous générez seront disponibles ici. <br />
                                    Par défaut ils sont privés et uniquement accessibles par vous. Vous pourrez les télécharger et les importer dans votre ENT.
                                </p>
                                <p>Pour créer des interactifs, vous pouvez :</p>
                                <p>
                                    <ol className="list-decimal list-inside space-y-2">
                                        <li>Cliquer sur <Link href={'/intelligence-artificielle/video-interactive'} >ce lien</Link> pour générer une vidéo interactive à partir d'une vidéo Science Infuse, YouTube ou MP4.</li>
                                        <li>Ouvrir une vidéo depuis les résultats de recherche et suivre les étapes de génération.</li>
                                        <li>Créer un cours et générer un quiz à partir de son contenu.</li>
                                    </ol>
                                </p>
                            </div>
                        </CallOut>
                    )}
                </div>
            </div>
        </div>
    );
}