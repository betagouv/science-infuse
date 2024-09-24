import Input from "@codegouvfr/react-dsfr/Input";
import { useState } from "@preact-signals/safe-react/react";

const ImportedFileSource = (props: {source: string, setSource: (source: string) => void}) => {
    return (
        <div className="flex flex-col justify-start items-start w-full gap-2">
            <div className="flex flex-col justify-start items-center w-full gap-2">
                <div className="flex flex-col justify-start items-start w-full gap-4">
                    <div className="flex justify-start items-center w-full gap-1.5 py-2 rounded-tl rounded-tr border-t-0 border-r-0 border-b-2 border-l-0 border-[#3a3a3a]">
                        <Input
                            label="Source"
                            className="w-full"
                            nativeInputProps={{
                                onClick: (e) => {e.preventDefault(); e.stopPropagation();},
                                type: "text",
                                value: props.source,
                                onChange: (e) => props.setSource(e.target.value),
                                required: true,
                                placeholder: "Source",
                            }}
                        />
                    </div>
                    <div className="flex justify-start items-start w-full relative pl-5">
                        <p className="w-full text-xs text-left text-black m-0">
                            Votre nom est indiqué par défaut. Si vous n'avez pas créé ce fichier, veuillez cliquer
                            sur votre nom pour modifier le texte et préciser la source. Vous portez la
                            responsabilité de son utilisation au sein du cours que vous créez.
                        </p>
                        <svg
                            width={16}
                            height={16}
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-shrink-0 w-4 h-4 absolute left-0 top-0.5"
                            preserveAspectRatio="none"
                        >
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M12.9993 1.66666H2.99935C2.26297 1.66666 1.66602 2.26362 1.66602 3V13C1.66602 13.7364 2.26297 14.3333 2.99935 14.3333H12.9993C13.7357 14.3333 14.3327 13.7364 14.3327 13V3C14.3327 2.26362 13.7357 1.66666 12.9993 1.66666ZM8.66602 4.66666H7.33268V6H8.66602V4.66666ZM8.66602 7.33333H7.33268V11.3333H8.66602V7.33333Z"
                                fill="black"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ImportedFileSource;