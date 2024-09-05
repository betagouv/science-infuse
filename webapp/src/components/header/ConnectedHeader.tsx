'use client'
import Button from "@codegouvfr/react-dsfr/Button"
import styled from "@emotion/styled";
import { Popover, Typography } from "@mui/material"
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";


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
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.99999 2.21883L1.69999 5.51883L0.757324 4.57616L4.99999 0.333496L9.24266 4.57616L8.29999 5.51883L4.99999 2.21883Z"
            fill="black"
        />
    </svg>)

const StyledButton = styled(Button)`
color: black !important;
&.fr-btn.si-custom {
    padding: 0.5rem 1rem !important;
    margin: 0 !important;
    background: white !important;
    &:hover {
        background: #f5f5f5 !important;
    }
    &.active {
        background: #dab4f4 !important;
    }
}
`
export default () => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const { data: session } = useSession();
    const user = session?.user;

    if (!user) return;

    console.log("USER", user)

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const router = useRouter();

    return (
        <div className="flex">

            <StyledButton
                onClick={handleClick}
                iconId="fr-icon-account-line"
                priority="secondary"
                className={`${open && "active"} si-custom flex flex-row gap-4 justify-center items-center`}
            >
                Mon espace
                <Arrow active={open} />
            </StyledButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <div className="flex flex-col w-full min-w-[20rem] bg-white border-t border-[#e3e3fd] shadow-md">
                    <div className="p-[1rem] flex flex-col gap-2 my-2">
                        {/* @ts-ignore */}
                        <p className="m-0 text-sm font-bold text-[#161616]">{user?.firstName} {user?.lastName} {user?.name}</p>
                        <p className="m-0 text-xs text-[#666]">{user?.email}</p>
                    </div>

                    <div className="flex flex-col">

                        {[
                            { icon: "fr-icon-book-2-line", text: "Mes cours", path: "/prof/mes-cours" },
                            { icon: "fr-icon-image-line", text: "Mes contenus favoris", path: "/prof/mes-favoris" },
                            { icon: "fr-icon-settings-5-line", text: "Paramètres du compte", path: "/prof/parametres" }
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
                                onClick={() => signOut()}
                                className="flex items-center gap-2 border-solid border-[#ddd] text-sm font-medium text-[#000091] w-full mx-4 py-2">
                                <i className="fr-icon fr-icon-logout-box-r-line mr-2" aria-hidden="true"></i>
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </Popover>
        </div>
    )
}