'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import RenderPdf from "../../RenderPdf";



export default function PdfPage({
    params,
}: {
    params: { pdfUuid: string, pageNumber: string },
}) {

    const { pdfUuid, pageNumber } = params;
    const [url, setUrl] = useState<string>();


    useEffect(() => {
        axios.get(`${NEXT_PUBLIC_SERVER_URL}/s3_url_pdf/${pdfUuid}`)
            .then(response => {
                setUrl(response.data)
            })
            .catch(error => {
                console.error('Error fetching PDF URL:', error)
            })
    }, [pdfUuid])

    return url ? <RenderPdf pdfUrl={url} pdfUuid={pdfUuid} defaultPage={parseInt(pageNumber as string)} /> : "loading"

}
