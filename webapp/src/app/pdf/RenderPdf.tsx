"use client"
import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { useEffect } from "@preact-signals/safe-react/react";
import axios from "axios";
import { useState } from "react";
import { pdfjs } from "react-pdf";
import { Document, Page } from 'react-pdf';
import { Button, IconButton, Typography, Box, CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const RenderPdf = (props: { pdfUrl: string, defaultPage: number }) => {
    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(props.defaultPage);
    const [loading, setLoading] = useState<boolean>(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
        setLoading(false)
    }

    const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
    const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || prev));

    return (
        <Box className="py-8 flex flex-col items-center gap-4 px-4 md:px-0">
            <Document
                file={props.pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="flex justify-center items-center flex-col gap-2">
                                    <span className="text-lg font-bold">Chargement du pdf en cours</span>
                                    <CircularProgress className="ml-2" />
                                </div>
                            }                >
                <Page pageNumber={pageNumber} />
            </Document>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton onClick={goToPrevPage} disabled={pageNumber <= 1}>
                    <ChevronLeft />
                </IconButton>
                <Typography variant="body1">
                    Page {pageNumber} sur {numPages ? numPages : '-'}
                </Typography>
                <IconButton onClick={goToNextPage} disabled={pageNumber >= (numPages || 0)}>
                    <ChevronRight />
                </IconButton>
            </Box>
        </Box>
    );
};

export default RenderPdf;