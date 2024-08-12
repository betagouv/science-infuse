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


export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const { showSnackbar } = useSnackbar();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            showSnackbar('Échec de connexion. Veuillez vérifier vos identifiants.', 'error')
        } else {
            router.push("/prof") // Redirect to home page or dashboard
        }
    }



    const handleGoogleSignIn = () => {
        signIn('google', { callbackUrl: '/prof' })
    };

    return (
        <div>

            <Breadcrumb segments={[]}
                homeLinkProps={{
                    href: '/'
                }} currentPageLabel={"Connexion"}>
            </Breadcrumb>
            <div className="md:p-16 p-8 w-full md:max-w-[700px] mx-auto bg-[--background-default-grey-hover]">
                <div className='flex flex-col gap-4'>
                    <h1>Connexion à Science Infuse</h1>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <Input
                            hintText="Format attendu : nom@domaine.fr"
                            label="Identifiant"
                            nativeInputProps={{
                                type: "email",
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                                required: true,
                                placeholder: "Email",
                            }}
                        />
                        <Input
                            label="Mot de passe"
                            nativeInputProps={{
                                type: "password",
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                                required: true,
                                placeholder: "Password",
                            }}
                        />
                        <Button type='submit'>Se connecter</Button>
                    </form>
                    <p>Vous n'avez pas de compte ? <a href="/prof/inscription">Créer un compte</a></p>
                </div>
            </div>
            <Snackbar />
        </div >

    );
}