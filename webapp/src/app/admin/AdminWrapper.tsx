"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import AdminListUsers from "./utilisateurs/page";
import IndexFile from "./index-file/page";
import JobList from "./tasks-list/page";
import InspectDocument from "./inspect-document/page";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";


const AdminWrapper = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [activePath, setActivePath] = useState("");

    useEffect(() => {
        setActivePath(pathname);
    }, [pathname]);

    return (
        <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center !m-0">
            <div className="fr-col-12 fr-col-md-10 fr-col-lg-8 main-content-item !p-0 mx-0 my-24">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/4">
                        <SideMenu
                            className="w-full m-0"
                            title="Admin"
                            align="left"
                            burgerMenuButtonText="Dans cette rubrique"
                            items={[
                                {
                                    isActive: activePath === "/admin/utilisateurs",
                                    linkProps: {
                                        href: "/admin/utilisateurs",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            router.push("/admin/utilisateurs");
                                        }
                                    },
                                    text: "Utilisateurs"
                                },
                                {
                                    isActive: activePath === "/admin/chapitres",
                                    linkProps: {
                                        href: "/admin/chapitres",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            router.push("/admin/chapitres");
                                        }
                                    },
                                    text: "Chapitres"
                                },
                                {
                                    isActive: activePath === "/admin/index-file",
                                    linkProps: {
                                        href: "/admin/index-file",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            router.push("/admin/index-file");
                                        }
                                    },
                                    text: "Indexer un fichier"
                                },
                                {
                                    isActive: activePath === "/admin/tasks-list",
                                    linkProps: {
                                        href: "/admin/tasks-list",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            router.push("/admin/tasks-list");
                                        }
                                    },
                                    text: "Liste des tâches"
                                },
                                {
                                    isActive: activePath === "/admin/inspect-document",
                                    linkProps: {
                                        href: "/admin/inspect-document",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            router.push("/admin/inspect-document");
                                        }
                                    },
                                    text: "Inspecter un document"
                                },
                                {
                                    isActive: activePath === "/admin/file-explorer",
                                    linkProps: {
                                        href: "/admin/file-explorer",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            router.push("/admin/file-explorer");
                                        }
                                    },
                                    text: "Explorer les fichiers"
                                },
                                {
                                    isActive: activePath === "/admin/document-tags",
                                    linkProps: {
                                        href: "/admin/document-tags",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            router.push("/admin/document-tags");
                                        }
                                    },
                                    text: "Tags des documents"
                                },
                            ]}
                        />
                    </div>
                    <div className="w-full md:w-3/4 mt-4 md:mt-0 px-8 md:px-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminWrapper;