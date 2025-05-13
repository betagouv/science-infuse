// Indiquez le chemin de votre page de connexion, par exemple:
// src/app/auth/signin/page.tsx ou src/app/connexion/page.tsx

'use client';

import { useSnackbar } from '@/app/SnackBarProvider';
import Snackbar from '@/course_editor/components/Snackbar';
import useWindowSize from '@/course_editor/hooks/useWindowSize';
import { apiClient } from '@/lib/api-client';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Academy, EducationLevel, SchoolSubject } from '@prisma/client';
import { signIn, getProviders, ClientSafeProvider, LiteralUnion } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import RegisterForm from './RegisterForm';
import { PROJECT_NAME } from '@/config';
import { BuiltInProviderType } from 'next-auth/providers/index';
import Image from 'next/image'; // Importer le composant Image de Next.js

const modal = createModal({
    id: "register-modal",
    isOpenedByDefault: false
});

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const { showSnackbar } = useSnackbar();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const error = searchParams.get('error');

    const [providers, setProviders] = useState<Record<LiteralUnion<BuiltInProviderType>, ClientSafeProvider> | null>(null);
    const [isGarButtonDisabled, setIsGarButtonDisabled] = useState(true); // Pour l'état disabled de l'image

    useEffect(() => {
        const fetchProviders = async () => {
            const res = await getProviders();
            setProviders(res);
            if (res?.gar) { // Si le fournisseur GAR est disponible
                setIsGarButtonDisabled(false);
            }
        };
        fetchProviders();

        if (error) {
            let errorMessage = "Une erreur d'authentification s'est produite.";
            if (error === "CredentialsSignin") {
                errorMessage = "Échec de connexion. Veuillez vérifier vos identifiants.";
            } else if (error === "OAuthAccountNotLinked") {
                errorMessage = "Ce compte est déjà lié à un autre fournisseur. Essayez de vous connecter avec ce fournisseur.";
            }
            showSnackbar(<p className='m-0'>{errorMessage}</p>, 'error');
        }
    }, [error, showSnackbar]);

    const handleSubmitCredentials = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: callbackUrl,
        });

        if (result?.error) {
            showSnackbar(<p className='m-0'>Échec de connexion. <br />Veuillez vérifier vos identifiants.</p>, 'error')

            // router.push(`/auth/signin?error=${result.error}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
        } else if (result?.ok) {
            router.push(callbackUrl);
        }
    };

    const handleGarSignIn = () => {
        if (isGarButtonDisabled) return; // Ne rien faire si le bouton est désactivé
        signIn('gar', { callbackUrl: callbackUrl });
    };

    const handleOpenModal = () => {
        modal.open();
    };

    const handleCloseModal = () => {
        modal.close();
    };

    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);
    const [academies, setAcademies] = useState<Academy[]>([]);
    const [schoolSubjects, setSchoolSubjects] = useState<SchoolSubject[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fetchedEducationLevels, fetchedAcademies, fetchedSchoolSubjects] = await Promise.all([
                    apiClient.getEducationLevels(),
                    apiClient.getAcademies(),
                    apiClient.getSchoolSubject()
                ]);
                setEducationLevels(fetchedEducationLevels);
                setAcademies(fetchedAcademies);
                setSchoolSubjects(fetchedSchoolSubjects);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const { isMobile } = useWindowSize();

    if (!providers && isGarButtonDisabled) { // Attendre que les providers soient chargés
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-4 ${isMobile ? 'px-8 sm:px-16 pb-16' : 'px-4' }`}>
            <h1 className='text-3xl sm:text-5xl m-0'>Connectez-vous</h1>
            <p className='text-gray-600 m-0'>Sauf mention contraire, tous les champs sont obligatoires.</p>

            {providers?.credentials && (
                <form onSubmit={handleSubmitCredentials} className='flex flex-col gap-4 mt-4'>
                    {/* ... Votre formulaire de connexion par identifiants ... */}
                     <Input
                        label="Login ou email professionnel"
                        nativeInputProps={{
                            type: "email",
                            value: email,
                            onChange: (e) => setEmail(e.target.value),
                            required: true,
                            autoComplete: "username"
                        }}
                    />
                    <Input
                        label="Mot de passe"
                        nativeInputProps={{
                            type: "password",
                            value: password,
                            onChange: (e) => setPassword(e.target.value),
                            required: true,
                            autoComplete: "current-password"
                        }}
                    />
                     <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative pl-5 text-xs text-gray-700">
                        <p className="m-0">
                            Pour rappel, votre mot de passe contient au moins :
                            <span className="font-bold"> 8 caractères, 1 lettre en majuscule, 1 lettre en minuscule</span> et
                            <span className="font-bold"> 1 chiffre</span>.
                        </p>
                        <svg
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-grow-0 flex-shrink-0 w-4 h-4 absolute left-0 top-0.5"
                            preserveAspectRatio="none"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M13 1.66667H3.00001C2.26363 1.66667 1.66667 2.26363 1.66667 3.00001V13C1.66667 13.7364 2.26363 14.3333 3.00001 14.3333H13C13.7364 14.3333 14.3333 13.7364 14.3333 13V3.00001C14.3333 2.26363 13.7364 1.66667 13 1.66667ZM8.66667 4.66667H7.33334V6H8.66667V4.66667ZM8.66667 7.33334H7.33334V11.3333H8.66667V7.33334Z"
                                fill="#0063CB"
                            />
                        </svg>
                    </div>
                    <p className="text-sm w-fit p-0" >Mot de passe oublié ?
                        <a className='ml-2 fr-link' href="/mot-de-passe-oublie">Cliquez ici</a>
                    </p>
                    <Button type='submit' className='w-full flex items-center justify-center'>Se connecter</Button>
                </form>
            )}

            {providers?.gar && (
                <>
                    <div className="flex items-center justify-center mt-4">
                        <hr className="flex-1 border-t border-gray-300 m-0"/>
                        <span className="mx-4 text-gray-500 p-[var(--text-spacing)]">OU</span>
                        <hr className="flex-1 border-t border-gray-300 m-0"/>
                    </div>

                    {/* Bouton GAR avec image personnalisée */}
                    <button
                        type="button"
                        onClick={handleGarSignIn}
                        disabled={isGarButtonDisabled}
                        className="gar-custom-button w-full p-0 border-0 bg-transparent cursor-pointer self-center"
                        aria-label="Se connecter avec le GAR" // Important pour l'accessibilité
                        style={{
                            backgroundImage: `url(${isGarButtonDisabled ? '/images/gar/BoutonGAR_Disabled.svg' : '/images/gar/BoutonGAR_Default.svg'})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            backgroundSize: 'contain', 
                            height: '50px', 
                            width: '200px', 
                        }}
                    >
                    </button>
                    {/* Fin Bouton GAR */}
                </>
            )}

            <div className="flex flex-col gap-4 mt-6">
                <hr className="border-t border-gray-300" />
                <h2 className="m-0 text-2xl sm:text-3xl font-bold">Vous n'avez pas de compte ?</h2>
                <Button onClick={handleOpenModal} priority="tertiary" className='w-full flex items-center justify-center'>S'inscrire</Button>
            </div>

            <Snackbar />
            <modal.Component className='z-[800]' title={`S'inscrire à ${PROJECT_NAME}`}>
                <RegisterForm handleCloseModal={handleCloseModal} educationLevels={educationLevels} academies={academies} schoolSubjects={schoolSubjects} />
            </modal.Component>
        </div>
    );
};
export default Login;