import { FormEvent, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Button } from '@codegouvfr/react-dsfr/Button';
import Checkbox from '@codegouvfr/react-dsfr/Checkbox';
import { useSnackbar } from '@/app/SnackBarProvider';
import Snackbar from '@/course_editor/components/Snackbar';

export default () => {
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


    return (
        <div className='flex flex-col gap-4'>
            <h1 className='text-5xl m-0'>Connectez-vous</h1>
            <p className='color-[#666666] m-0'>Sauf mention contraire, tous les champs sont obligatoires.</p>

            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                <Input
                    // hintText="Format attendu : prénomnom@culture.gouv"
                    label="Email professionnel"
                    nativeInputProps={{
                        type: "email",
                        value: email,
                        onChange: (e) => setEmail(e.target.value),
                        required: true,
                        // placeholder: "Email",
                    }}
                />
                <Input
                    label="Mot de passe"
                    nativeInputProps={{
                        type: "password",
                        value: password,
                        onChange: (e) => setPassword(e.target.value),
                        required: true,
                        // placeholder: "Password",
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
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M13 1.66667H3.00001C2.26363 1.66667 1.66667 2.26363 1.66667 3.00001V13C1.66667 13.7364 2.26363 14.3333 3.00001 14.3333H13C13.7364 14.3333 14.3333 13.7364 14.3333 13V3.00001C14.3333 2.26363 13.7364 1.66667 13 1.66667ZM8.66667 4.66667H7.33334V6H8.66667V4.66667ZM8.66667 7.33334H7.33334V11.3333H8.66667V7.33334Z"
                            fill="#0063CB"
                        />
                    </svg>
                </div>
                <button className="text-sm w-fit p-0 border-solid border-0 border-b-2 border-[#000091]" >Mot de passe oublié ?</button>


                <Checkbox
                    className='mt-4'
                    options={[
                        {
                            label: <p className='m-0 ml-2'>J’accepte les <a href="" target='_blank'>CGU</a><br /><span className='self-stretch flex-grow-0 flex-shrink-0 w-[258px] text-xs text-left text-[#666]'>Obligatoire</span></p>,
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
            {/* <p>Vous n'avez pas de compte ? <a href="/prof/inscription">Créer un compte</a></p> */}

            <div className="flex flex-col gap-4">
                <hr className="p-4 mt-4 border-t border-[#DDDDDD]" />
                <h2 className="m-0 text-3xl font-bold">Vous n'avez pas de compte ?</h2>
                <div className="flex flex-col gap-2">
                    <p className="m-0 text-sm text-[#666]">Envoyez un e-mail au responsable du service :</p>
                    <a href="mailto:o.rabet@universcience.fr" target='_blank' className="w-fit text-sm border-b border-[#000091] inline-block">
                        o.rabet@universcience.fr
                    </a>
                </div>
            </div>
        </div>

    )
}