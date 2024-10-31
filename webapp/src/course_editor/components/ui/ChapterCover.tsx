import { ChapterWithoutBlocks } from "@/types/api";

export default function ChapterCover(props: { chapter: ChapterWithoutBlocks }) {
    return (
        <div className="w-full aspect-[792/351] bg-[#e3e3fd] mb-8">
            <div className="w-full h-full mx-4 py-2 flex">
                <div className="w-1/2 h-full overflow-hidden">
                    <img src={props.chapter?.coverPath || "https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png"} alt="Cover" className="w-full h-full object-cover" />
                </div>

                <div className="w-1/2 flex flex-col justify-center -ml-4">
                    <div className="flex flex-col p-4 bg-[#e3e3fd]">
                        <div className="flex gap-3">
                            <p className="m-0 text-base font-thin text-[#161616]">SVT</p>
                            {props.chapter?.educationLevels && <p className="m-0 text-base font-thin text-[#161616]">{props.chapter?.educationLevels.map(el => el.name).join(", ")}</p>}
                        </div>
                        <div>
                            <p className="text-2xl sm:text-3xl font-bold text-[#161616]">
                                {props.chapter?.title}
                            </p>
                        </div>
                        {props.chapter?.theme && <div>
                            <p className="m-0 text-base sm:text-lg text-[#161616]">
                                Thème : {props.chapter?.theme?.title}
                            </p>
                        </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}