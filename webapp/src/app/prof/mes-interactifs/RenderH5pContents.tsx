'use client';

import { DocumentWithChunks, h5pIdToPublicUrl } from "@/types/vectordb";
import H5PContentCard from "./H5PContentCard";
import { MasonaryItem } from "@/components/MasonaryItem";
import Masonry from "@mui/lab/Masonry";
import { H5PContent } from "@prisma/client";

export default (props: {contents: (H5PContent & { documents: DocumentWithChunks[] })[]}) => {
    return <Masonry columns={2} spacing={2}>
        {props.contents.map((content, index) => {
            const h5pPublicUrl = h5pIdToPublicUrl(content.h5pId, content.s3ObjectName);
            return (
                <MasonaryItem className="w-full" key={index}>
                    <H5PContentCard h5pPublicUrl={h5pPublicUrl} key={content.id} content={content} />
                </MasonaryItem>
            )
        }
        )}
    </Masonry>

}