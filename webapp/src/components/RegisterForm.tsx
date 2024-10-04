'use client';
import { UserSettingsField } from "@/app/prof/parametres/UserSettings";
import { useSnackbar } from "@/app/SnackBarProvider";
import Snackbar from "@/course_editor/components/Snackbar";
import { apiClient, UserFull } from "@/lib/api-client";
import Button from "@codegouvfr/react-dsfr/Button";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import { Academy, EducationLevel, SchoolSubject } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import * as React from 'react';


export default function RegisterForm(props: { handleCloseModal: () => void, educationLevels: EducationLevel[], academies: Academy[], schoolSubjects: SchoolSubject[] }) {
    const { showSnackbar } = useSnackbar();
    const [user, setUser] = useState<UserFull | null>(null)
    const [email, setEmail] = useState(user?.firstName || "");
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [academy, setAcademy] = useState("");
    const [educationLevels, setEducationLevels] = useState<string[]>([]);
    const [school, setSchool] = useState("");
    const [schoolSubjects, setSchoolSubjects] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [job, setJob] = useState("");

    const educationOptions = props.educationLevels.map(e => ({ value: e.id, label: e.name }))
    const schoolSubjectsOptions = props.schoolSubjects.map(e => ({ value: e.id, label: e.name }))


    const router = useRouter();

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!firstName || !email || !password || !job || !confirmPassword) {
            setErrorMessage("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas.");
            return;
        }

        if (!validatePassword(password)) {
            setErrorMessage("Le mot de passe doit contenir au moins 8 caractères, 1 lettre en majuscule, 1 lettre en minuscule et 1 chiffre.");
            return;
        }

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    school,
                    academyId: academy,
                    schoolSubjects: props.schoolSubjects.filter(ss => schoolSubjects.includes(ss.id)),
                    educationLevels: props.educationLevels.filter(el => educationLevels.includes(el.id)),
                }),
            })

            if (response.ok) {
                props.handleCloseModal();
            } else {
                const data = await response.json()
                setErrorMessage(data.error || "Une erreur s'est produite lors de l'inscription.");
            }
        } catch (error) {
            setErrorMessage("Une erreur s'est produite lors de l'inscription.");
        }
    }

    const updateUser = async (userData: Partial<UserFull>) => {
        try {
            await apiClient.updateUser(userData);
            showSnackbar(<p className="m-0">Profil enregistré avec succès</p>, 'success')
        } catch (error) {
            setErrorMessage("Une erreur s'est produite lors de la mise à jour du profil.");
        }
    }

    return (
        <div className="flex w-full flex-col gap-8">
            <p className="m-0 text-2xl font-bold text-left text-[#161616]">
                S'inscrire à Science Infuse
            </p>
            <p className="m-0 text-sm text-left text-[#666]">
                Tous les champs mentionnés avec une * sont obligatoires.
            </p>
            {errorMessage && <p className="m-0 text-red-500 sticky top-[-4rem] bg-white z-[1] text-center py-6">{errorMessage}</p>}
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>

                <UserSettingsField
                    isEditable
                    alwaysEditable={true}
                    required={true}
                    label="Prénom *"
                    value={firstName}
                    onValidate={async () => { await updateUser({ firstName: firstName }) }}
                    onChange={(_) => setFirstName(_ as string)}
                />

                <UserSettingsField
                    isEditable
                    alwaysEditable={true}
                    label="Nom"
                    value={lastName}
                    onValidate={async () => { await updateUser({ lastName: lastName }) }}
                    onChange={(_) => setLastName(_ as string)}
                />

                <UserSettingsField
                    label="Email professionnel *"
                    required={true}
                    alwaysEditable={true}
                    value={email}
                    onChange={(_) => setEmail(_ as string)}
                />
                <UserSettingsField
                    label="Mot de passe *"
                    required={true}
                    alwaysEditable={true}
                    value={password}
                    onChange={(_) => setPassword(_ as string)}
                    isPassword
                    hint={<span>Pour rappel, le mot de passe doit contenir au moins : 8 caractères, 1 lettre en majuscule, 1 lettre en minuscule et 1 chiffre.</span>}
                />
                <UserSettingsField
                    label="Confirmer le mot de passe *"
                    required={true}
                    alwaysEditable={true}
                    value={confirmPassword}
                    onChange={(_) => setConfirmPassword(_ as string)}
                    isPassword
                />

                <UserSettingsField
                    label="Métier *"
                    required={true}
                    alwaysEditable={true}
                    value={job}
                    onChange={(_) => setJob(_ as string)}
                />

                <UserSettingsField
                    isEditable
                    label="Académie de rattachement"
                    required={false}
                    alwaysEditable={true}
                    isSelect
                    value={academy}
                    onChange={(_) => setAcademy(_ as string)}
                    onValidate={async () => { await updateUser({ academyId: academy }) }}
                    options={props.academies.map(a => ({ value: a.id, label: a.name }))}
                    hint="Cette information permettra d'exporter les contenus et les cours vers l'ENT."
                />


                {/* <UserSettingsField
                    isEditable
                    label="Mon école"
                    required={false}
                    alwaysEditable={true}
                    value={school}
                    onChange={(_) => setSchool(_ as string)}
                    onValidate={async () => { await updateUser({ school }) }}
                /> */}




                <UserSettingsField
                    isEditable
                    required={false}
                    label="Matière enseignée"
                    alwaysEditable={true}
                    isMultiSelect
                    value={schoolSubjects}
                    onChange={(value) => setSchoolSubjects(value as string[])}
                    options={schoolSubjectsOptions}
                    onValidate={async () => { await updateUser({ schoolSubjects: props.schoolSubjects.filter(ss => schoolSubjects.includes(ss.id)) }) }}
                    hint="Nous avons besoin de cette information afin de développer notre catalogue de cours avec ce qui vous sera le plus utile."
                />

                <UserSettingsField
                    isEditable
                    required={false}
                    alwaysEditable={true}
                    isMultiSelect
                    label="Niveaux auxquels j'enseigne pour l'année 2024-2025"
                    value={educationLevels}
                    onChange={(value) => setEducationLevels(value as string[])}
                    options={educationOptions}
                    onValidate={async () => { await updateUser({ educationLevels: props.educationLevels.filter(el => educationLevels.includes(el.id)) }) }}
                    hint="Plusieurs choix possible. Nous avons besoin de cette information afin de développer notre catalogue de cours avec ce qui vous sera le plus utile."
                />

                <div className="flex justify-end gap-4">
                    <Button type="button" onClick={() => router.push("/")} priority="secondary">Annuler</Button>
                    <Button className="bg-black" type="submit" priority="primary">S'inscrire</Button>
                </div>
            </form>
        </div>
    );
}