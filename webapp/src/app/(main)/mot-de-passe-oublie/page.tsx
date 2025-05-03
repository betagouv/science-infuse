'use client';

import { apiClient } from '@/lib/api-client';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import Input from '@codegouvfr/react-dsfr/Input';
import { useState } from 'react';

export default function AskForPasswordReset() {
    const [email, setEmail] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSuccess(false);

        await apiClient.askForPasswordReset(email)

        setSuccess(true);
    };

    return (
        <div className="fr-container fr-my-6w">
            <div className="fr-grid-row fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-9 fr-col-lg-6">
                    <h1 className="fr-h1 fr-mb-3w">Demande de réinitialisation de mot de passe</h1>
                    {!success ? (
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Adresse e-mail"
                                nativeInputProps={{
                                    type: "email",
                                    value: email,
                                    onChange: (e) => setEmail(e.target.value),
                                    placeholder: "Entrez votre adresse e-mail",
                                    required: true,
                                }}
                            />
                            <Button type="submit" className="fr-mt-2w">
                                Demander la réinitialisation
                            </Button>
                        </form>
                    ) : (
                        <Alert
                            severity="success"
                            description="Un e-mail de réinitialisation a été envoyé si l'adresse existe dans notre système."
                            small
                            closable={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}