import { ChunkWithScoreUnion } from "@/types/vectordb";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useState } from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { apiClient } from "@/lib/api-client";
import { CUSTOM_ERRORS } from "@/lib/customErrors";
import { useAlertToast } from "../AlertToast";

const ReportContentModal = ({ reportModal, documentChunk }: { reportModal: { Component: any, close: any }, documentChunk: ChunkWithScoreUnion }) => {
    console.log("chunkidinmodal", documentChunk.id);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [details, setDetails] = useState("");
    const alertToast = useAlertToast();

    const optionsMap = {
        'incorrect_info': 'Le contenu présente des informations scientifiquement inexactes',
        'outdated_data': 'Les données sont obsolètes',
        'irrelevant_content': 'Le contenu est hors sujet ou mal catégorisé',
        'add_details': 'Ajouter des détails'
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (event.target.checked) {
            setSelectedOptions([...selectedOptions, value]);
        } else {
            setSelectedOptions(selectedOptions.filter(option => option !== value));
        }
    };

    return (
        <reportModal.Component
            title={`Reporter ce résultat de recherche ?`}

            buttons={[
                {
                    doClosesModal: false,
                    children: "Signaler",
                    onClick: async () => {
                        const reportText = `- ${selectedOptions.map(option => optionsMap[option as keyof typeof optionsMap]).join("\n- ")}\n ${details}`;
                        try {
                            await apiClient.reportChunk(documentChunk.id, reportText);
                            alertToast.success(
                                "Reçu",
                                `Nous avons bien reçu votre signalement.`,
                            );

                        } catch (error: any) {
                            if (error.response?.data?.error === CUSTOM_ERRORS.ALREADY_REPORTED) {
                                console.log('responseresponseThis chunk has already been reported', error)
                                alertToast.warning(
                                    "Erreur",
                                    `Vous avez déjà signalé ce résultat de recherche.`,
                                );
                            }
                        }
                        reportModal.close()
                    }
                }
            ]}
        >
            <div className="flex flex-col items-start w-full gap-4 mt-8">
                <p className="m-0 text-center w-full font-bold">Contenu textuel du document</p>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '200px', overflowY: 'auto', background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    {documentChunk.text}
                </pre>

                <div className="flex flex-col gap-0">
                    <Checkbox
                        className="[&_.fr-label]:text-left [&_.fr-message]:!m-0"
                        legend={<span className="font-bold">Pourquoi voulez-vous reporter ce contenu ?</span>}
                        stateRelatedMessage={selectedOptions.length == 0 ? "Veuillez sélectionner au moins une raison" : ""}
                        options={Object.entries(optionsMap).map(([value, label]) => ({
                            label,
                            nativeInputProps: {
                                name: label,
                                value,
                                onChange: handleCheckboxChange
                            }
                        }))}
                    />

                    {selectedOptions.includes('add_details') && (
                        <Input textArea className="w-full text-start" label="Détails"
                            nativeTextAreaProps={{
                                name: 'details',
                                value: details,
                                onChange: (e) => setDetails(e.target.value)
                            }}
                        />
                    )}
                </div>
            </div>
        </reportModal.Component>
    )
}
export default ReportContentModal;