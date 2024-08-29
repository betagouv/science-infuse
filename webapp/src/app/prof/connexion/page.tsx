'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { useSnackbar } from '@/app/SnackBarProvider';
import Snackbar from '@/course_editor/components/Snackbar';
import Login from '@/components/Login';


export default function SignIn() {
    return (
        <div>

            <Breadcrumb segments={[]}
                homeLinkProps={{
                    href: '/'
                }} currentPageLabel={"Connexion"}>
            </Breadcrumb>
            <Login />
            <Snackbar />
        </div >

    );
}