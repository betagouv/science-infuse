import { useSnackbar } from '@/app/SnackBarProvider';
import Snackbar from '@/course_editor/components/Snackbar';
import useWindowSize from '@/course_editor/hooks/useWindowSize';
import { apiClient } from '@/lib/api-client';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { Academy, EducationLevel, SchoolSubject } from '@prisma/client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import RegisterForm from './RegisterForm';

const modal = createModal({
    id: "register-modal",
    isOpenedByDefault: false
});

const Login = () => {
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
            showSnackbar(<p className='m-0'>Échec de connexion. <br />Veuillez vérifier vos identifiants.</p>, 'error')
        } else {
            router.push("/") // Redirect to home page or dashboard
        }
    }

    const handleOpenModal = () => {
        modal.open()
    };

    const handleCloseModal = () => {
        modal.close();
    };

    const [resetLinkDisabled, setResetLinkDisabled] = useState(false);
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

    return (
        <div className={`flex flex-col gap-4 ${isMobile && 'px-16 pb-16'}`}>
            <h1 className='text-5xl m-0'>Connectez-vous</h1>
            <p className='color-[#666666] m-0'>Sauf mention contraire, tous les champs sont obligatoires.</p>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <Input
                    label="Email professionnel"
                    nativeInputProps={{
                        type: "email",
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        required: true,
                    }}
                />
                <Input
                    label="Mot de passe"
                    nativeInputProps={{
                        type: "password",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true,
                    }}
                />

                <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative pl-5">
                    <p className="text-xs text-left m-0">
                        Pour rappel, votre mot de passe contient au moins :
                        <span className="font-bold">8 caractères, 1 lettre en majuscule, 1 lettre en minuscule</span> et
                        <span className="font-bold">1 chiffre</span>.
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
                    <a className='ml-2' href="/mot-de-passe-oublie">Cliquez ici</a>
                </p>

                <Button type='submit' className='w-full flex items-center justify-center'>Se connecter</Button>
            </form>

            <div className="flex flex-col gap-4">
                <hr className="p-4 mt-4 border-t border-[#DDDDDD]" />
                <h2 className="m-0 text-3xl font-bold">Vous n'avez pas de compte ?</h2>

                <Button onClick={handleOpenModal} className='w-full flex items-center justify-center'>S'inscrire</Button>

            </div>
            <Snackbar />
            <modal.Component className='z-[800]' title="S'inscrire à Science Infuse">
                <RegisterForm handleCloseModal={handleCloseModal} educationLevels={educationLevels} academies={academies} schoolSubjects={schoolSubjects} />
            </modal.Component>
        </div>
    )
}
export default Login;