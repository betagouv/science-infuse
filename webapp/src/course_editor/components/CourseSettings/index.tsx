import { Editor } from "@tiptap/react";
import ExportToPdf from "./ExportToPdf";
import ExportToMbz from "./ExportToMbz";
import CourseInformations from "./CourseInformations";
import ShareToScienceInfuse from "./ShareToScienceInfuse";
import DuplicateChapter from "./DuplicateChapter";
import { ChapterWithoutBlocks } from "@/types/api";
import { useSession } from "next-auth/react";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import Button from "@codegouvfr/react-dsfr/Button";

const CourseSettings = (props: { chapter?: ChapterWithoutBlocks, editor: Editor }) => {
    const { data: session } = useSession();
    const user = session?.user;

    return <div className="lg:sticky lg:top-8 min-h-full lg:min-h-screen bg-white z-[1] flex flex-col gap-8 w-full">
        <CourseInformations editor={props.editor} />
        <div className="flex flex-col gap-4 sticky bottom-0 pb-4 w-full items-center justify-center z-[20] bg-white mt-auto px-0">
            {user ? <>
                {props.chapter?.id && !props.editor.isEditable && <DuplicateChapter chapterId={props.chapter.id} editor={props.editor} />}
                <ExportToPdf editor={props.editor} />
                <ExportToMbz editor={props.editor} />
            </> : <CallOut
                iconId="ri-information-line"
                className="flex flex-col [&.fr-callout__text]:flex-col w-full"
            >
                <span>
                    Connectez-vous pour exporter le cours en PDF ou MBZ et les quiz en H5P.
                </span>
                <span className="flex flex-row gap-4 flex-wrap justify-center">
                    <Button priority="secondary"><a href="/connexion">Connexion</a></Button>
                    {/* <Button><a href="/">Créer un compte</a></Button> */}
                </span>
            </CallOut>}
            {props.editor.isEditable && props.chapter && <ShareToScienceInfuse chapter={props.chapter} />}
        </div>
    </div>
}

export default CourseSettings;