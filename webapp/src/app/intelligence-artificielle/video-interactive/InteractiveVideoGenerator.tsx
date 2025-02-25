import Image from 'next/image'
import Search from "@/app/recherche/page";
import SearchPage from "@/app/recherche/SearchPage";
import { selectedTabType, TabType } from "@/app/recherche/Tabs";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { useRef, useState } from "react";
import SIVideoPicker from "./SIVideoPicker";
import ChunkRenderer from "@/app/recherche/DocumentChunkFull";
import { ChunkWithScoreUnion } from "@/types/vectordb";
import ExternalVideoPicker from "./ExternalVideoPicker";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import styled from '@emotion/styled';
import YoutubeVideoPicker from './YoutubeVideoPicker';
import Help from './Help';
import { generateInteraciveVideoData } from '@/app/api/export/h5p/contents/interactiveVideo';


const StyledSegControl = styled(SegmentedControl)`
color: #161616;
legend {
    font-weight: bold;
}
.fr-segmented__element {
    width: 100%;
    text-align: center;

    label {
        align-items: center;
        justify-content: center;
    }
}
.fr-segmented__elements {
    width: 100%;
    align-items: center;
    justify-content: space-evenly;
}`;

enum ImportType {
    RECHERCHE = 'Rechercher dans la bibliothèque',
    LIEN = 'Ajouter un lien vidéo',
    IMPORT = 'Importer une vidéo'
}

export default () => {


    const [selectedDocument, setSelectedDocument] = useState<ChunkWithScoreUnion>();
    const [importType, setImportType] = useState<ImportType>(ImportType.RECHERCHE);

    const onDocumentIdPicked = async (documentId: string) => {
        console.log("generateInteraciveVideoData loading")
        const iv = await generateInteraciveVideoData({ documentId });
        console.log("generateInteraciveVideoData", iv)
    }

    return (
        <div className="flex flex-col w-full gap-16 items-center">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8 w-full">
                <Image
                    src="/images/interactive-video-illustration.svg"
                    height={300}
                    width={300}
                    alt="Picture of the author"
                    className="w-[100px] sm:w-[150px] md:w-[200px] lg:w-[250px] h-auto object-contain mix-blend-multiply mx-auto" />
                <div className="flex flex-col justify-center max-w-2xl flex-1">
                    <p className="text-base sm:text-lg md:text-xl text-start text-[#161616] mb-4 sm:mb-6">
                        Créez facilement des quiz et définitions pour enrichir vos vidéos éducatives en recherchant ou en important une vidéo.
                    </p>
                    <StyledSegControl
                        className='&_legend]:text-[#161616] w-full [&_.fr-segmented__elements]:w-full' legend="Ma vidéo : "
                        segments={[
                            {
                                label: ImportType.RECHERCHE,
                                nativeInputProps: {
                                    checked: importType === ImportType.RECHERCHE,
                                    onChange: () => setImportType(ImportType.RECHERCHE)
                                }
                            },
                            {
                                label: ImportType.LIEN,
                                nativeInputProps: {
                                    checked: importType === ImportType.LIEN,
                                    onChange: () => setImportType(ImportType.LIEN)
                                }
                            },
                            {
                                label: ImportType.IMPORT,
                                nativeInputProps: {
                                    checked: importType === ImportType.IMPORT,
                                    onChange: () => setImportType(ImportType.IMPORT)
                                }
                            }
                        ]}
                    />

                </div>
            </div>


            <div className={`w-full ${importType === ImportType.RECHERCHE ? 'block' : 'hidden'}`}>
                <SIVideoPicker onDocumentIdPicked={onDocumentIdPicked} />
            </div>
            <div className={`w-full ${importType === ImportType.LIEN ? 'block' : 'hidden'}`}>
                <YoutubeVideoPicker onDocumentIdPicked={onDocumentIdPicked} />
            </div>
            <div className={`w-full ${importType === ImportType.IMPORT ? 'block' : 'hidden'}`}>
                <ExternalVideoPicker onDocumentIdPicked={onDocumentIdPicked} />
            </div>
            {selectedDocument && <ChunkRenderer chunk={selectedDocument} searchWords={[]} />}

            <Help />

        </div>
    );
}