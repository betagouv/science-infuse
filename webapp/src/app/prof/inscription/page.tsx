'use client';

import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from '@codegouvfr/react-dsfr/Button';

export default function Inscription() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState("")
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")
    
        try {
          const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, firstName, lastName }),
          })
    
          if (response.ok) {
            router.push("/prof/connexion") // Redirect to sign-in page after successful registration
          } else {
            const data = await response.json()
            setError(data.error || "Registration failed")
          }
        } catch (error) {
          setError("An error occurred during registration")
        }
      }

    return (
        <div>
            <Breadcrumb 
                segments={[]}
                homeLinkProps={{
                    href: '/'
                }} 
                currentPageLabel={"Inscription"}
            />
            <div className="md:p-16 p-8 w-full md:max-w-[700px] mx-auto bg-[var(--background-default-grey-hover)]">
                <div className='flex flex-col gap-4'>
                    <h1>Inscription à Science Infuse</h1>

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <Input
                            label="Prénom"
                            nativeInputProps={{
                                type: "text",
                                value: firstName,
                                onChange: (e) => setFirstName(e.target.value),
                                required: true,
                                placeholder: "Prénom",
                            }}
                        />
                        <Input
                            label="Nom"
                            nativeInputProps={{
                                type: "text",
                                value: lastName,
                                onChange: (e) => setLastName(e.target.value),
                                required: true,
                                placeholder: "Nom",
                            }}
                        />
                        <Input
                            hintText="Format attendu : nom@domaine.fr"
                            label="Adresse e-mail"
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
                                placeholder: "Mot de passe",
                            }}
                        />
                        <Input
                            label="Confirmer le mot de passe"
                            nativeInputProps={{
                                type: "password",
                                value: confirmPassword,
                                onChange: (e) => setConfirmPassword(e.target.value),
                                required: true,
                                placeholder: "Confirmer le mot de passe",
                            }}
                        />
                        <Button type="submit">S'inscrire</Button>
                    </form>
                    <p>Vous avez déjà un compte ? <a href="/prof/connexion">Se connecter</a></p>
                </div>
            </div>
        </div>
    );
}