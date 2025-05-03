"use client";
import { useState, useEffect, useRef } from "react";
import {
    IconButton,
    Typography,
    Box,
    CircularProgress,
    TextField,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { QueryFunction, useQuery } from "@tanstack/react-query";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { apiClient } from "@/lib/api-client";
import { TableOfContents, TOCItem } from "@/types/TOC";
import { useSession } from "next-auth/react";
import RegisteredUserFeature from "@/components/RegisteredUserFeature";

// Setup pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

interface SideMenuItemProps {
    text: React.ReactNode;
    linkProps?: {
        href: string;
    };
    items?: SideMenuItemProps[];
    isActive?: boolean;
}

const convertTOCToSideMenuItems = (
    tocItems: TOCItem[],
    activePage: number,
    setPage: (page: number) => void
): SideMenuItemProps[] => {
    const getEffectivePage = (item: TOCItem): number => {
        if (item.page && item.page !== 0) return item.page;
        if (item.items && item.items.length > 0) {
            const childrenPages = item.items
                .map(getEffectivePage)
                .filter((p) => p !== 0);
            return childrenPages.length > 0 ? Math.min(...childrenPages) : 0;
        }
        return 0;
    };

    return tocItems
        .sort((a, b) => getEffectivePage(a) - getEffectivePage(b))
        .map((item) => ({
            text: (
                <div className="flex w-full justify-between">
                    <span>
                        {item.text.charAt(0).toUpperCase() +
                            item.text.slice(1).toLowerCase().replaceAll("\\", "")}
                    </span>
                    {item.page !== 0 && (
                        <span className="ml-2 text-gray-500">{item.page}</span>
                    )}
                </div>
            ),
            isActive:
                item.page === activePage ||
                (item.items || []).some((i) => i.page <= activePage) &&
                (item.items || []).some((i) => i.page >= activePage),
            expandedByDefault:
                item.page === activePage ||
                (item.items || []).some((i) => i.page <= activePage) &&
                (item.items || []).some((i) => i.page >= activePage),
            linkProps: {
                href: "#",
                onClick: () => {
                    console.log("TEST", item.page);
                    item.page && setPage(item.page);
                },
                target: "_self",
            },
            ...(item.items && {
                items: convertTOCToSideMenuItems(item.items, activePage, setPage),
            }),
        }));
};

const fetchTableOfContents: QueryFunction<TableOfContents, [string, string]> =
    async ({ queryKey }) => {
        const [_, documentUuid] = queryKey;
        const toc = await apiClient.getDocumentToc(documentUuid);
        return toc;
    };

const RenderPdf = (props: {
    pdfUrl: string;
    pdfUuid: string;
    defaultPage: number;
}) => {
    const { data: session } = useSession();
    const user = session?.user;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [numPages, setNumPages] = useState<number>();
    const [pageNumber, setPageNumber] = useState<number>(props.defaultPage);
    const [inputValue, setInputValue] = useState<string>(props.defaultPage.toString());
    // For mobile PDF width
    const [pdfWidth, setPdfWidth] = useState<number>(0);
    const pdfContainerRef = useRef<HTMLDivElement>(null);

    const { data: toc } = useQuery({
        queryKey: ["tableOfContents", props.pdfUuid],
        queryFn: fetchTableOfContents,
        enabled: !!props.pdfUuid,
    });

    function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
        setNumPages(numPages);
    }

    const goToPrevPage = () => {
        const newPage = Math.max(pageNumber - 1, 1);
        setPageNumber(newPage);
        setInputValue(newPage.toString());
    };
    const goToNextPage = () => {
        const newPage = Math.min(pageNumber + 1, numPages || pageNumber);
        setPageNumber(newPage);
        setInputValue(newPage.toString());
    };

    const handlePageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        const newPage = parseInt(newValue);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= (numPages || 1)) {
            setPageNumber(newPage);
        }
    };

    const handleBlur = () => {
        const newPage = parseInt(inputValue);
        if (isNaN(newPage) || newPage < 1 || newPage > (numPages || 1)) {
            setInputValue(pageNumber.toString());
        }
    };

    // Measure PDF container width on mobile
    useEffect(() => {
        if (isMobile && pdfContainerRef.current) {
            const updateWidth = () => {
                setPdfWidth(pdfContainerRef.current!.clientWidth - 16); // Subtract padding
            };
            updateWidth();
            window.addEventListener("resize", updateWidth);
            return () => window.removeEventListener("resize", updateWidth);
        }
    }, [isMobile, numPages]);

    if (!user)
        return (
            <div className="fr-col-12 fr-container main-content-item py-4">
                <RegisteredUserFeature />
            </div>
        );

    // MOBILE LAYOUT
    if (isMobile) {
        return (
            <Box display="flex" flexDirection="column" height="100vh">
                {/* Sticky Table of Contents at the top */}
                <Box
                    sx={{
                        flexShrink: 0,
                        position: "sticky",
                        overflow: 'hidden',
                        top: 0,
                        zIndex: 1000,
                        bgcolor: "background.paper",
                        p: 0,
                    }}
                >
                    {!toc ? (
                        <Box display="flex" alignItems="center" flexDirection="column" gap={2}>
                            <Typography variant="h6">Chargement du sommaire</Typography>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <SideMenu
                            sticky={true}
                            align="left"

                            //   @ts-ignore
                            items={convertTOCToSideMenuItems(toc.items, pageNumber, (page) => {
                                setPageNumber(page);
                                setInputValue(page.toString());
                            })}
                            title="Table des matières"
                            burgerMenuButtonText="Table des matières"
                        />
                    )}
                </Box>

                {/* PDF container fills available space */}
                <Box
                    ref={pdfContainerRef}
                    sx={{
                        flex: 1,
                        overflow: "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 1,
                        width: "100%",
                    }}
                >
                    <Document
                        file={props.pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <Box display="flex" alignItems="center" flexDirection="column" gap={2}>
                                <Typography variant="h6">Chargement du pdf en cours</Typography>
                                <CircularProgress />
                            </Box>
                        }
                    >
                        <Page pageNumber={pageNumber} width={pdfWidth} />
                    </Document>
                </Box>

                {/* Sticky navigation at the bottom */}
                <Box
                    sx={{
                        flexShrink: 0,
                        position: "sticky",
                        bottom: 0,
                        zIndex: 1000,
                        bgcolor: "background.paper",
                        p: 1,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            justifyContent: "center",
                        }}
                    >
                        <IconButton onClick={goToPrevPage} disabled={pageNumber <= 1}>
                            <ChevronLeft />
                        </IconButton>
                        <Typography variant="body1">Page</Typography>
                        <TextField
                            type="number"
                            value={inputValue}
                            onChange={handlePageChange}
                            onBlur={handleBlur}
                            inputProps={{ min: 1, max: numPages }}
                            sx={{
                                width: "4rem",
                                "& .MuiInputBase-input": { padding: "4px 8px" },
                            }}
                        />
                        <Typography variant="body1">
                            sur {numPages ? numPages : "-"}
                        </Typography>
                        <IconButton
                            onClick={goToNextPage}
                            disabled={pageNumber >= (numPages || 0)}
                        >
                            <ChevronRight />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        );
    }

    // DESKTOP LAYOUT (Original)
    return (
        <div className="flex flex-row mt-8 justify-center">
            <div
                className="container"
                style={{
                    width: 400,
                }}
            >
                {!toc ? (
                    <div className="flex justify-center items-center flex-col gap-2">
                        <span className="text-lg font-bold">Chargement du sommaire</span>
                        <CircularProgress className="ml-2" />
                    </div>
                ) : (
                    <SideMenu
                        sticky={true}
                        align="left"
                        // @ts-ignore
                        items={convertTOCToSideMenuItems(toc.items, pageNumber, (page) => {
                            setPageNumber(page);
                            setInputValue(page.toString());
                        })}
                        title="Table des matières"
                    />
                )}
            </div>

            <Box className="py-8 flex flex-col items-center justify-between gap-4 px-4 md:px-0 min-h-screen">
                <Document
                    file={props.pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex justify-center items-center flex-col gap-2">
                            <span className="text-lg font-bold">
                                Chargement du pdf en cours
                            </span>
                            <CircularProgress className="ml-2" />
                        </div>
                    }
                >
                    <Page pageNumber={pageNumber} />
                </Document>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton onClick={goToPrevPage} disabled={pageNumber <= 1}>
                        <ChevronLeft />
                    </IconButton>
                    <Typography variant="body1">Page</Typography>
                    <TextField
                        type="number"
                        value={inputValue}
                        onChange={handlePageChange}
                        onBlur={handleBlur}
                        inputProps={{ min: 1, max: numPages }}
                        sx={{
                            width: "4rem",
                            "& .MuiInputBase-input": { padding: "4px 8px" },
                        }}
                    />
                    <Typography variant="body1">
                        sur {numPages ? numPages : "-"}
                    </Typography>
                    <IconButton
                        onClick={goToNextPage}
                        disabled={pageNumber >= (numPages || 0)}
                    >
                        <ChevronRight />
                    </IconButton>
                </Box>
            </Box>
        </div>
    );
};

export default RenderPdf;
