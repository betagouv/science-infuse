'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';


export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            // Handle error
            console.error(result.error)
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
            <div className="md:p-16 p-8 w-full md:max-w-[700px] mx-auto bg-[var(--background-default-grey-hover)]">
                <div className='flex flex-col gap-4'>
                    <h1>Connexion à Science Infuse</h1>

                    {/* <h2>Se connecter avec Google</h2>

                    <Button onClick={handleGoogleSignIn} title="S'identifier avec FranceConnect" priority="secondary" className="flex items-center justify-center h-12 px-4 py-2 space-x-2 text-sm font-medium">
                        <img src="/login/google.svg" alt="logo google" className="w-5 h-5" />
                        <p>S'identifier avec Google</p>
                    </Button>

                    <div className="flex items-center my-4">

                        <div className="flex-grow border-solid border-t border-[1px] border-gray-400"></div>
                        <span className="mx-4 text-gray-600 text-xl">ou</span>
                        <div className="flex-grow border-solid border-t border-[1px] border-gray-400"></div>
                    </div>

                    <h2>Se connecter avec son compte</h2> */}
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
                        {/* <a href="#" className='w-fit'>Mot de passe oublié ?</a>
                        <Checkbox
                            options={[
                                {
                                    label: 'Se souvenir de moi',
                                    nativeInputProps: {
                                        name: 'checkboxes-1',
                                        value: 'value1'
                                    }
                                }]}
                        />
 */}
                        <Button type='submit'>Se connecter</Button>
                    </form>
                    <p>Vous n'avez pas de compte ? <a href="/prof/inscription">Créer un compte</a></p>
                </div>
            </div>
        </div >

    );
}