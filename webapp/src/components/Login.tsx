import { FormEvent, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { useSnackbar } from '@/app/SnackBarProvider';
import Snackbar from '@/course_editor/components/Snackbar';
import { Modal, Box } from '@mui/material';
import RegisterForm from './RegisterForm';
import { Academy, EducationLevel, SchoolSubject } from '@prisma/client';
import { apiClient } from '@/lib/api-client';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [openModal, setOpenModal] = useState(false);
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
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
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


    return (
        <div className='flex flex-col gap-4'>
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
                <p className="text-sm w-fit p-0" >Mot de passe oublié ? Contactez scienceinfuse@universcience.fr</p>
                <Checkbox
                    className='mt-4'
                    options={[
                        {
                            label: <p className='m-0 ml-2'>J'accepte les <a href="" target='_blank'>CGU</a><br /><span className='self-stretch flex-grow-0 flex-shrink-0 w-[258px] text-xs text-left text-[#666]'>Obligatoire</span></p>,
                            nativeInputProps: {
                                name: 'checkboxes-1',
                                value: 'value3'
                            }
                        }
                    ]}
                    state="default"
                />

                <Button type='submit' className='w-full flex items-center justify-center bg-black text-[#fff]'>Se connecter</Button>
            </form>

            <div className="flex flex-col gap-4">
                <hr className="p-4 mt-4 border-t border-[#DDDDDD]" />
                <h2 className="m-0 text-3xl font-bold">Vous n'avez pas de compte ?</h2>

                <Button onClick={handleOpenModal} className='w-full flex items-center justify-center bg-black text-[#fff]'>S'inscrire</Button>

            </div>
            <Snackbar />

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="inscription"
                className='flex items-center justify-center'
            >
                <div className="relative bg-white">
                    <button onClick={handleCloseModal} className="absolute top-6 right-6 flex-grow-0 flex-shrink-0 text-sm font-medium text-center text-[#000091]">Fermer</button>

                    <div className="max-h-[80vh] w-[600px] max-w-full  overflow-y-auto p-16">
                        <RegisterForm educationLevels={educationLevels} academies={academies} schoolSubjects={schoolSubjects} />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
export default Login;