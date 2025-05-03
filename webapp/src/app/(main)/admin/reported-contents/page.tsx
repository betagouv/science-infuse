import prisma from "@/lib/prisma";
import AdminWrapper from "../AdminWrapper";
import ReportedContentView, { ReportedDocumentWithChunk } from "./ReportedContentView";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { Document, DocumentChunk, ReportedDocumentChunk, ReportedDocumentChunkStatus, UserRoles } from "@prisma/client";
import { DocumentWithChunks } from "@/types/vectordb";


const Page = async () => {
    const session = await getServerSession(authOptions);
    const user = session?.user

    if (!user || !user.roles?.includes(UserRoles.ADMIN)) {
        redirect("/");
    }

    const reportedContent = await prisma.reportedDocumentChunk.findMany(
        {
            where: {
                status: ReportedDocumentChunkStatus.OPEN
            },
            include: {
                user: true,
                documentChunk: {
                    include: {
                        metadata: true,
                        document: true,
                    }
                },
            }
        }
    ) as ReportedDocumentWithChunk[]
    

    return (
        <AdminWrapper>
            <ReportedContentView reportedContents={reportedContent} />
        </AdminWrapper>
    )
}
export default Page;