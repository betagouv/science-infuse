'use client';

import Login from "@/components/Login";

export default function Page() {
    return (
        <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-4 main-content-item my-16">
                <Login />
            </div>
        </div>


    )
}