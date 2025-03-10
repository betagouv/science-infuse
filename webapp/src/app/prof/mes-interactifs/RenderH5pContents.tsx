'use client';

import { DocumentWithChunks, h5pIdToPublicUrl } from "@/types/vectordb";
import H5PContentCard from "./H5PContentCard";
import { MasonaryItem } from "@/components/MasonaryItem";
import Masonry from "@mui/lab/Masonry";
import { H5PContent } from "@prisma/client";
import { useState } from "react";
import Pagination from "@codegouvfr/react-dsfr/Pagination";

export default (props: { deleteH5p: (contentId: string) => Promise<void>, contents: (H5PContent & { documents: DocumentWithChunks[] })[] }) => {
    const [page, setPage] = useState(1);
    const itemsPerPage = 6;
    const startIndex = (page - 1) * itemsPerPage;
    const displayedContents = props.contents.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col gap-4">
            <Masonry columns={2} spacing={2}>
                {displayedContents.map((content, index) => {
                    const h5pPublicUrl = h5pIdToPublicUrl(content.h5pId, content.s3ObjectName);
                    return (
                        <MasonaryItem className="w-full" key={index}>
                            <H5PContentCard deleteH5p={props.deleteH5p} h5pPublicUrl={h5pPublicUrl} key={content.id} content={content} />
                        </MasonaryItem>
                    )
                })}
            </Masonry>
            <div className='flex items-center justify-center z-[1] w-full sticky bottom-0 bg-white pt-4'>
                <Pagination
                    className="w-fit"
                    count={Math.ceil(props.contents.length / itemsPerPage)}
                    defaultPage={page}
                    getPageLinkProps={(page) => ({
                        onClick: () => setPage(page),
                        href: "#",
                    })}
                    showFirstLast
                />
            </div>
        </div>
    )
}