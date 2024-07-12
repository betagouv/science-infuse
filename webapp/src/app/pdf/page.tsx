'use client';
import { useEffect, useState } from "react";
import RenderPdf from "./RenderPdf";
import axios from "axios";
import { NEXT_PUBLIC_SERVER_URL } from "@/config";

export default function Pdf() {

    const [url, setUrl] = useState<string>();
    const s3_object_name = "pdf/40776654-f565-44c5-b0b3-a5b1f1d74636.pdf"
    
    useEffect(() => {
        axios.get(`${NEXT_PUBLIC_SERVER_URL}/s3_url/${s3_object_name}`)
            .then(response => {
                console.log("s3_object_name", s3_object_name)
                console.log("s3url", response.data)
                setUrl(response.data)
            })
            .catch(error => {
                console.error('Error fetching PDF URL:', error)
            })
    }, [])


  return url ? <RenderPdf pdfUrl={url} defaultPage={10}/> : "loading"
}
