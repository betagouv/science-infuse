"use client";

import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import AdminListUsers from "./pages/AdminListUsers";

const AdminPage = () => {
    const pathname = usePathname();
    const [activeHash, setActiveHash] = useState("");

    useEffect(() => {
        const handleHashChange = () => {
            setActiveHash(window.location.hash);
        };

        handleHashChange(); // Set initial hash
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const renderContent = () => {
        switch (activeHash) {
            case "#utilisateurs":
                return <AdminListUsers/>
            default:
                return <div>Sélectionnez une option dans le menu</div>;
        }
    };

    return (
        <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-8 main-content-item my-24">
                <div className="flex flex-row">
                    <div
                        className="container"
                        style={{
                            width: 300,
                            minWidth: 200
                        }}
                    >
                        <SideMenu
                            title="Admin"
                            align="left"
                            burgerMenuButtonText="Dans cette rubrique"
                            items={[
                                {
                                    isActive: activeHash === "#utilisateurs",
                                    linkProps: {
                                        href: "#utilisateurs"
                                    },
                                    text: "Utilisateurs"
                                },
                            ]}
                        />
                    </div>
                    <div className="w-full">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;