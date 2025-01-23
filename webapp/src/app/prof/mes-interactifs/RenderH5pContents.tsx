'use client';

import { h5pIdToPublicUrl } from "@/types/vectordb";
import H5PContentCard from "./H5PContentCard";
import { MasonaryItem } from "@/components/MasonaryItem";
import Masonry from "@mui/lab/Masonry";

export default (props: {contents: any[]}) => {
    return <Masonry columns={2} spacing={2}>
        {props.contents.map((content, index) => {
            const h5pPublicUrl = h5pIdToPublicUrl(content.h5pId);
            return (
                <MasonaryItem className="w-full" key={index}>
                    <H5PContentCard h5pPublicUrl={h5pPublicUrl} key={content.id} content={content} />
                </MasonaryItem>
            )
        }
        )}
    </Masonry>

}