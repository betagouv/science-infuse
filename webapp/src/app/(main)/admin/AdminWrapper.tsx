'use client'

import prisma from "@/lib/prisma";
import { getReportedContentCount } from "@/lib/utils/db";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useEffect } from "@preact-signals/safe-react/react";
import { ReportedDocumentChunkStatus } from "@prisma/client";
import { Suspense, useState } from "react";

const AdminWrapper = ({ children }: { children: React.ReactNode }) => {
    const [reportedContentCount, setReportedContentCount] = useState<number>(0);
    useEffect(() => {
        const fetchCount = async () => {
            const count = await getReportedContentCount();
            setReportedContentCount(count);
        };
        fetchCount();
    }, []);

    return (<div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center !m-0">
        <div className="fr-col-12 fr-col-md-10 fr-col-lg-10 main-content-item !p-0 mx-0 my-24">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4">
                    {/* <AdminClient> */}
                    <SideMenu
                        className="w-full m-0"
                        title="Admin"
                        align="left"
                        burgerMenuButtonText="Dans cette rubrique"
                        items={[
                            {
                                linkProps: {
                                    href: "/admin/utilisateurs",
                                },
                                text: "Utilisateurs"
                            },
                            {
                                linkProps: {
                                    href: "/admin/chapitres",
                                },
                                text: "Chapitres"
                            },
                            {
                                linkProps: {
                                    href: "/admin/reported-contents",
                                },
                                text: <>Contenus signalés {reportedContentCount ? <Badge noIcon severity="error" className="ml-2">{reportedContentCount}</Badge> : ""}</>
                            },
                            {
                                linkProps: {
                                    href: "/admin/index-content",
                                },
                                text: "Indexer du contenu"
                            },
                            {
                                linkProps: {
                                    href: "#",
                                },
                                text: "Tâches",
                                items: [
                                    {
                                        linkProps: {
                                            href: "/admin/tasks-list-youtube",
                                        },
                                        text: "YouTube CRON"
                                    },
                                    {
                                        linkProps: {
                                            href: "/admin/tasks-list",
                                        },
                                        text: "Tâches admin"
                                    }
                                ]
                            },
                            {
                                linkProps: {
                                    href: "/admin/inspect-document",
                                },
                                text: "Inspecter un document"
                            },
                            {
                                linkProps: {
                                    href: "/admin/file-explorer",
                                },
                                text: "Explorer les fichiers"
                            },
                            {
                                linkProps: {
                                    href: "/admin/document-tags",
                                },
                                text: "Tags des documents"
                            },
                            {
                                linkProps: {
                                    href: "/admin/parametres",
                                },
                                text: "Parametres"
                            },
                        ]}
                    />
                    {/* </AdminClient> */}
                </div>
                <div className="w-full md:w-3/4 mt-4 md:mt-0 px-8 md:px-0">
                    <Suspense fallback={<div>
                        <img className="aspect-square w-16 mb-4" src="https://portailpro.gouv.fr/assets/spinner-9a2a6d7a.gif" alt="Chargement" />

                    </div>}>
                        {children}
                    </Suspense>
                </div>
            </div>
        </div>
    </div>
    );
};

export default AdminWrapper;