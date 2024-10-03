'use client'
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import Button from "@codegouvfr/react-dsfr/Button"
import styled from "@emotion/styled";
import { Popover, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material"
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useState } from "react";
import { useOnClickOutside } from "usehooks-ts";


const Arrow = (props: { active: boolean }) => (
    <svg
        width={10}
        height={6}
        viewBox="0 0 10 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ transform: props.active ? 'none' : 'rotate(180deg)' }}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.99999 2.21883L1.69999 5.51883L0.757324 4.57616L4.99999 0.333496L9.24266 4.57616L8.29999 5.51883L4.99999 2.21883Z"
            fill="black"
        />
    </svg>)


const StyledAccordionSummary = styled(AccordionSummary)`
    display: flex;
    border: 1px solid black;
    box-shadow: none !important;
    justify-content: space-between;
    color: black !important;
    padding: 0.5rem 1rem !important;
    margin: 0 !important;
    background: white !important;
    /* height: 2rem !important; */
    min-height: unset !important;
    &:hover {
        background: #f5f5f5 !important;
    }
    &.active {
        background: #dab4f4 !important;
    }
    &.Mui-expanded {
        min-height: unset !important;
        margin: 0!important;
    }
    .MuiAccordionSummary-content {
        &.Mui-expanded {
            min-height: unset !important;
            margin: 0!important;
        }
        margin: 0;
    }
`;

export default () => {
    const [expanded, setExpanded] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();
    const user = session?.user;
    const { isMobile, isTablet } = useWindowSize();
    const accordionRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(accordionRef, () => setExpanded(false))
    if (!user) return;


    const handleClose = () => {
        setExpanded(false);
    };

    return (
        <div className={`flex ${isTablet && "!pr-0"}`} id="connected-header">
            <Accordion ref={accordionRef} className={`z-[10000] ${isTablet ? "w-full " : "w-[11rem]"} !shadow-none [&_.MuiCollapse-root]:w-fit`}
                expanded={expanded}
                onChange={() => setExpanded(!expanded)}
            >
                <StyledAccordionSummary
                    expandIcon={<Arrow active={expanded} />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >

                    <i className="fr-icon fr-icon-account-line mr-2" aria-hidden="true"></i>
                    <p className="m-0">Mon espace</p>

                </StyledAccordionSummary>
                <AccordionDetails className="!m-0 !p-0 w-full">
                    <div className="flex flex-col w-full bg-white border-t border-[#e3e3fd] whitespace-nowrap">
                        <div className="p-[1rem] flex flex-col gap-2 my-2 items-start">
                            {/* @ts-ignore */}
                            <p className="m-0 text-sm font-bold text-[#161616]">{user?.firstName} {user?.lastName} {user?.name}</p>
                            <p className="m-0 text-xs text-[#666]">{user?.email}</p>
                        </div>

                        <div className="flex flex-col">

                            {[
                                { icon: "fr-icon-book-2-line", text: "Mes cours", path: "/prof/mes-cours" },
                                { icon: "fr-icon-image-line", text: "Mes contenus favoris", path: "/prof/mes-favoris" },
                                { icon: "fr-icon-settings-5-line", text: "Paramètres du compte", path: "/prof/parametres" },
                            ].map((item, index) => (
                                <button
                                    onClick={() => {
                                        router.push(item.path)

                                        handleClose();
                                    }}
                                    key={index}
                                    className="flex items-center cursor-pointer p-[1rem]"
                                    style={{ borderTop: `2px solid #DDDDDD` }}>
                                    <i className={`fr-icon ${item.icon} mr-2`} aria-hidden="true"></i>
                                    <p className="m-0 text-sm font-medium text-[#161616]">{item.text}</p>
                                </button>
                            ))}

                            <div className="mt-4 pb-4 w-full flex items-center justify-center">
                                <button
                                    onClick={() => { handleClose(); signOut(); }}
                                    className="flex items-center gap-2 border-solid border-[#ddd] text-sm font-medium text-[#000091] w-full mx-4 py-2">
                                    <i className="fr-icon fr-icon-logout-box-r-line mr-2" aria-hidden="true"></i>
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    )
}