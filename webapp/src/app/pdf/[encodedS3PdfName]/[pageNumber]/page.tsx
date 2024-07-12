'use client';
import { useEffect, useState } from "react";
import axios from "axios";
import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import RenderPdf from "../../RenderPdf";
import { useRouter } from "next/router";

// export default function Pdf() {
export default function PdfPage({
    params,
}: {
    params: { encodedS3PdfName: string, pageNumber: string },
}) {

    const { encodedS3PdfName, pageNumber } = params;
    console.log("encodedS3PdfName", encodedS3PdfName, pageNumber)



    // const router = useRouter();
    // const { encodedS3PdfName, pageNumber } = router.query;
    const decodedPdfUrl = decodeURIComponent(encodedS3PdfName as string);
    // const decodedPdfUrl = "pdf/40776654-f565-44c5-b0b3-a5b1f1d74636.pdf";
    const [url, setUrl] = useState<string>();
    useEffect(() => {
        axios.get(`${NEXT_PUBLIC_SERVER_URL}/s3_url/${decodedPdfUrl}`)
            .then(response => {
                console.log("s3_pdf_name", decodedPdfUrl)
                console.log("s3url", response.data)
                setUrl(response.data)
            })
            .catch(error => {
                console.error('Error fetching PDF URL:', error)
            })
    }, [])


    return url ? <RenderPdf pdfUrl={url} defaultPage={parseInt(pageNumber as string)} /> : "loading"
}
