'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSnackbar } from '../SnackBarProvider';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { validatePassword } from '@/lib/utils';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const { showSnackbar } = useSnackbar();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSuccess(false);
        setErrorMessage('');

        if (!validatePassword(password)) {
            setErrorMessage("Le mot de passe doit contenir au moins 8 caractères, 1 lettre en majuscule, 1 lettre en minuscule et 1 chiffre.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Les mots de passe ne correspondent pas.');
            return;
        }

        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            setErrorMessage(data.error);
            return;
        }

        setSuccess(true);
        showSnackbar("Mot de passe mis à jour avec succès.", "success");
        router.push('/connexion');
    };

    return (
        <div className="fr-container fr-my-6w">
            <div className="fr-grid-row fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
                    <h1 className="fr-h1 fr-mb-3w">Réinitialiser votre mot de passe</h1>
                    {!success ? (
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Nouveau mot de passe"
                                nativeInputProps={{
                                    type: "password",
                                    value: password,
                                    onChange: (e) => setPassword(e.target.value),
                                    placeholder: "Entrez votre nouveau mot de passe",
                                    required: true,
                                }}
                            />
                            <Input
                                label="Confirmer le mot de passe"
                                nativeInputProps={{
                                    type: "password",
                                    value: confirmPassword,
                                    onChange: (e) => setConfirmPassword(e.target.value),
                                    placeholder: "Confirmez votre nouveau mot de passe",
                                    required: true,
                                }}
                                className="fr-mt-2w"
                            />
                            <Button type="submit" className="fr-mt-2w">
                                Réinitialiser le mot de passe
                            </Button>
                        </form>
                    ) : (
                        <Alert
                            severity="success"
                            description="Votre mot de passe a été réinitialisé avec succès."
                            small
                            closable={false}
                        />
                    )}
                    {errorMessage && (
                        <Alert
                            severity="error"
                            description={errorMessage}
                            small
                            closable={false}
                            className="fr-mt-2w"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
