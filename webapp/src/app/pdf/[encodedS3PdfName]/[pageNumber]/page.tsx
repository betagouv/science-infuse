'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import RenderPdf from "../../RenderPdf";
import { QueryFunction, useQuery } from "@tanstack/react-query";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";

interface TOCItem {
    text: string;
    page: number;
    items?: TOCItem[];
}

interface TableOfContents {
    items: TOCItem[];
}

interface SideMenuItemProps {
    text: string;
    linkProps?: {
        href: string;
    };
    items?: SideMenuItemProps[];
    isActive?: boolean;
}


const convertTOCToSideMenuItems = (tocItems: TOCItem[]): SideMenuItemProps[] => {
    return tocItems.map(item => ({
        text: item.text,
        linkProps: {
            href: "#",
            onClick: () => { console.log("TEST") },
            target: "_self"
        },
        ...(item.items && { items: convertTOCToSideMenuItems(item.items) })
    }));
};




const fetchTableOfContents: QueryFunction<TableOfContents, [string, string]> = async ({ queryKey }) => {
    const [_, documentUuid] = queryKey;
    const response = await axios.post(
        `${NEXT_PUBLIC_SERVER_URL}/document/toc`,
        {},  // empty body
        {
            params: { document_uuid: documentUuid },  // query parameters
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
};



export default function PdfPage({
    params,
}: {
    params: { encodedS3PdfName: string, pageNumber: string },
}) {

    const { encodedS3PdfName, pageNumber } = params;
    const decodedPdfUrl = decodeURIComponent(encodedS3PdfName as string);
    const [url, setUrl] = useState<string>();
    const documentUuid = "b6a7357a-cb3c-4329-ab6d-b0d1cff83df8"


    useEffect(() => {
        axios.get(`${NEXT_PUBLIC_SERVER_URL}/s3_url/${decodedPdfUrl}`)
            .then(response => {
                setUrl(response.data)
            })
            .catch(error => {
                console.error('Error fetching PDF URL:', error)
            })
    }, [decodedPdfUrl])



    return url ? <RenderPdf pdfUrl={url} defaultPage={parseInt(pageNumber as string)} /> : "loading"

}
