'use client';
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/SelectNext";
import { useState } from "@preact-signals/safe-react/react";
import { EducationLevel } from "@prisma/client";
import { User } from "next-auth";

const CustomInput = ({ isPassword, editable, ...props }: { editable: boolean, isPassword: boolean;[key: string]: any }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                textArea={false}
                label={props.label || ""}
                nativeInputProps={{
                    ...props.nativeInputProps,
                    type: isPassword ? (showPassword ? "text" : "password") : props.nativeInputProps.type,
                }}
            />
            {isPassword && editable && (
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-[2.5rem] transform flex items-center justify-center"
                >
                    {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                        </svg>
                    )}
                </button>
            )}
        </div>
    );
};

interface FieldProps {
    isEditable?: boolean;
    label: string;
    value: string;
    onChange: (value: string) => void;
    hint?: React.ReactNode;
    isPassword?: boolean;
    isSelect?: boolean;
    options?: { value: string; label: string }[];
}

const Field = (props: FieldProps) => {
    const [editable, setEditable] = useState(false);
    return (
        <div className="relative flex flex-col gap-4">
            <div className="relative">
                {props.isSelect ? (
                    <Select
                        disabled={!editable}
                        label={props.label}
                        nativeSelectProps={{
                            value: props.value,
                            onChange: (e) => props.onChange(e.target.value)
                        }}
                        options={props.options || []}
                    />
                ) : (
                    <CustomInput
                        disabled={!editable}
                        label={props.label}
                        style={{ margin: 0 }}
                        editable={editable}
                        nativeInputProps={{
                            value: props.value,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => props.onChange(e.target.value)
                        }}
                        state="default"
                        stateRelatedMessage="Texte de validation"
                        isPassword={!!props.isPassword}
                    />
                )}
            </div>
            {props.hint && <div className="flex items-start gap-2">
                <svg
                    width={14}
                    height={14}
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="none"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12.0003 0.666748H2.00033C1.26395 0.666748 0.666992 1.2637 0.666992 2.00008V12.0001C0.666992 12.7365 1.26395 13.3334 2.00033 13.3334H12.0003C12.7367 13.3334 13.3337 12.7365 13.3337 12.0001V2.00008C13.3337 1.2637 12.7367 0.666748 12.0003 0.666748ZM7.66699 3.66675H6.33366V5.00008H7.66699V3.66675ZM7.66699 6.33341H6.33366V10.3334H7.66699V6.33341Z"
                        fill="black"
                    />
                </svg>
                <span className="text-sm">{props.hint}</span>
            </div>}
            {props.isEditable && <div className="flex w-full justify-end">
                <button onClick={() => setEditable(!editable)} className="italic">{editable ? "Valider" : "Modifier"}</button>
            </div>}
        </div>
    )
}

export default function UserSettings(props: { educationLevels: EducationLevel[], user: User }) {
    const { user } = props;
    console.log("USERRR", user)
    console.log("USERRR el", props.educationLevels)
    const [firstname, setFirstname] = useState(user.firstName || "");
    const [lastname, setLastname] = useState(user.lastName || "");
    const [email, setEmail] = useState(user.email  || "");
    const [password, setPassword] = useState("xxxxxxxxx");
    const [academy, setAcademy] = useState("");
    const [educationLevels, setEducationLevels] = useState("");
    const [subjectTaught, setSubjectTaught] = useState("");

    const educationOptions = props.educationLevels.map(e => ({ value: e.id, label: e.name }))
    
    const academyOptions = [
        { value: "aix-marseille", label: "Aix-Marseille" },
        { value: "amiens", label: "Amiens" },
        { value: "besancon", label: "Besançon" },
    ];

    const subjectTaughtOptions = [
        { value: "mathematiques", label: "Mathématiques" },
        { value: "francais", label: "Français" },
        { value: "histoire-geographie", label: "Histoire-Géographie" },
        { value: "sciences", label: "Sciences" },
        { value: "anglais", label: "Anglais" },
        { value: "arts-plastiques", label: "Arts Plastiques" },
        { value: "education-physique", label: "Éducation Physique" },
        { value: "musique", label: "Musique" },
        { value: "technologie", label: "Technologie" },
        { value: "philosophie", label: "Philosophie" },
        { value: "sciences-economiques", label: "Sciences Économiques" },
        { value: "langues-vivantes", label: "Langues Vivantes" },
        { value: "latin-grec", label: "Latin-Grec" },
        { value: "physique-chimie", label: "Physique-Chimie" },
        { value: "svt", label: "Sciences de la Vie et de la Terre" }
    ]
    return (
        <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
            <div className="fr-col-12 fr-col-md-6 main-content-item my-24">
                <div className="flex flex-col gap-8">
                    <Field isEditable label="Prénom" value={firstname} onChange={setFirstname} />
                    <Field isEditable label="Nom" value={lastname} onChange={setLastname} />
                    <Field label="Email professionnel" value={email} onChange={setEmail} />
                    <Field label="Mot de passe" value={password} onChange={setPassword} isPassword hint={<span>Pour rappel, le mot de passe doit contenir au moins : 8 caractères, 1 lettre en majuscule, 1 lettre en minuscule et 1 chiffre.</span>} />

                    <Field
                        isEditable
                        isSelect
                        label="Académie de rattachement"
                        value={academy}
                        onChange={setAcademy}
                        options={academyOptions}
                        hint="Cette information permettra d'exporter les contenus et les cours vers l'ENT."
                    />

                    <Field
                        isEditable
                        isSelect
                        label="Niveaux auxquels j’enseigne pour l’année 2024-2025"
                        value={educationLevels}
                        onChange={setEducationLevels}
                        options={educationOptions}
                        hint="Plusieurs choix possible. Nous avons besoin de cette information afin de développer notre catalogue de cours avec ce qui vous sera le plus utile."
                    />

                    <Field
                        isEditable
                        isSelect
                        label="Matière enseignée"
                        value={subjectTaught}
                        onChange={setSubjectTaught}
                        options={subjectTaughtOptions}
                        hint="Nous avons besoin de cette information afin de développer notre catalogue de cours avec ce qui vous sera le plus utile."
                    />
                </div>
            </div>
        </div>
    );
}