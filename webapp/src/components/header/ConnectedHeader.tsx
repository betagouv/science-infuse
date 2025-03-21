"use client";

import React, { useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { UserRoles } from "@prisma/client";
import styled from "@emotion/styled";
import { useOnClickOutside } from "usehooks-ts";
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import Button from "@codegouvfr/react-dsfr/Button";

//
// --- Styled Components ---
//
const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  .fr-icon--sm::before, .fr-icon--sm::after {
    --icon-size: 1.3em !important;
  }
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MenuPanel = styled.div`
  position: absolute;
  top: calc(100% - 1px);
  right: 0;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e3e3fd;
  width: 16rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    position: static;
    width: 100%;
    border: none;
    box-shadow: none;
  }
`;

const UserInfo = styled.div`
  text-align: left;
  padding: 1rem;
  p {
    margin: 0;
  }
  .user-name {
    font-weight: bold;
    font-size: 0.875rem;
    color: #161616;
  }
  .user-email {
    font-size: 0.75rem;
    color: #666;
  }
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  color: #161616;
  background: none;
  border: none;
  border-top: 1px solid #ddd;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }

  i {
    font-size: 1rem;
  }
`;

const SignOutWrapper = styled.div`
  margin-top: 1rem;
  padding-bottom: 0.5rem;
  display: flex;
  justify-content: center;
`;

const SignOutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #000091;
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

//
// --- Main Component ---
//
export default function MonEspaceDropdown() {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;
    const pathName = usePathname();
    const router = useRouter();
    const { isMobile, isTablet } = useWindowSize();

    const dropdownRef = useRef<HTMLDivElement>(null);
    useOnClickOutside(dropdownRef, () => setOpen(false));

    // If not authenticated
    if (!user) {
        // Avoid showing "Me connecter" on the /connexion page itself
        if (pathName === "/connexion") return null;

        return (
            <div className="flex h-full items-center justify-center relative">

                <Button
                    linkProps={{ href: "/connexion" }}
                    className={`!m-0 flex !shadow-[inset_0_0_0_1px_#dddddd] ${open ? '!bg-[#e3e3fd]' : ''}`} priority="secondary"
                >
                    <div className="flex p-1 gap-4 items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M6.99998 0.333374C10.68 0.333374 13.6666 3.32004 13.6666 7.00004C13.6666 10.68 10.68 13.6667 6.99998 13.6667C3.31998 13.6667 0.333313 10.68 0.333313 7.00004C0.333313 3.32004 3.31998 0.333374 6.99998 0.333374ZM3.01531 9.27737C3.99398 10.7374 5.46331 11.6667 7.10665 11.6667C8.74931 11.6667 10.2193 10.738 11.1973 9.27737C10.0878 8.24044 8.62528 7.66458 7.10665 7.66671C5.58779 7.66441 4.12499 8.24028 3.01531 9.27737ZM6.99998 6.33337C8.10455 6.33337 8.99998 5.43794 8.99998 4.33337C8.99998 3.2288 8.10455 2.33337 6.99998 2.33337C5.89541 2.33337 4.99998 3.2288 4.99998 4.33337C4.99998 5.43794 5.89541 6.33337 6.99998 6.33337Z" fill="#000091" />
                        </svg>
                        <span>Me connecter</span>
                    </div>
                </Button>
            </div>
        );
    }

    // Menu items
    const menuItems = [
        { icon: "fr-icon-book-2-line", text: "Mes cours", path: "/prof/mes-cours" },
        { icon: "fr-icon-star-line", text: "Mes contenus favoris", path: "/prof/mes-favoris" },
        { icon: "fr-icon-play-circle-line", text: "Mes contenus interactifs", path: "/prof/mes-interactifs" },
        ...(user.roles || []).includes(UserRoles.ADMIN)
            ? [{ icon: "fr-icon-admin-line", text: "Espace admin", path: "/admin/utilisateurs" }]
            : [],
        { icon: "fr-icon-settings-5-line", text: "Paramètres du compte", path: "/prof/parametres" },
    ];

    const handleItemClick = (path: string) => {
        setOpen(false);
        router.push(path);
    };

    const handleSignOut = async () => {
        setOpen(false);
        await signOut();
        router.push("/");
    };

    return (
        <div className="flex h-full w-full">
            <DropdownContainer ref={dropdownRef} className={`m-0 ${isTablet ? "!pr-0" : ""}`}>
                <div className="flex relative">

                    {!isMobile && (
                        <Button className={`!m-0 flex !shadow-[inset_0_0_0_1px_#dddddd] ${open ? '!bg-[#e3e3fd]' : ''}`} priority="secondary" onClick={() => setOpen(!open)}>
                            <div className="flex p-1 gap-4 items-center justify-center">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M6.99998 0.333374C10.68 0.333374 13.6666 3.32004 13.6666 7.00004C13.6666 10.68 10.68 13.6667 6.99998 13.6667C3.31998 13.6667 0.333313 10.68 0.333313 7.00004C0.333313 3.32004 3.31998 0.333374 6.99998 0.333374ZM3.01531 9.27737C3.99398 10.7374 5.46331 11.6667 7.10665 11.6667C8.74931 11.6667 10.2193 10.738 11.1973 9.27737C10.0878 8.24044 8.62528 7.66458 7.10665 7.66671C5.58779 7.66441 4.12499 8.24028 3.01531 9.27737ZM6.99998 6.33337C8.10455 6.33337 8.99998 5.43794 8.99998 4.33337C8.99998 3.2288 8.10455 2.33337 6.99998 2.33337C5.89541 2.33337 4.99998 3.2288 4.99998 4.33337C4.99998 5.43794 5.89541 6.33337 6.99998 6.33337Z" fill="#000091" />
                                </svg>
                                <span>Mon espace</span>
                                <svg style={{ rotate: `${open ? 0 : 180}deg` }} width={10} height={6} viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M4.99999 2.21883L1.69999 5.51883L0.757324 4.57616L4.99999 0.333496L9.24266 4.57616L8.29999 5.51883L4.99999 2.21883Z" fill="currentColor" />
                                </svg>
                            </div>
                        </Button>
                    )}

                    {(isMobile || open) && (
                        <MenuPanel>
                            <UserInfo>
                                <p className="user-name">
                                    {user?.firstName} {user?.lastName} {user?.name}
                                </p>
                                <p className="user-email">{user?.email}</p>
                            </UserInfo>

                            {menuItems.map(({ icon, text, path }, index) => (
                                <MenuItem key={index} onClick={() => handleItemClick(path)}>
                                    <i className={`fr-icon fr-icon--sm ${icon}`} aria-hidden="true" />
                                    {text}
                                </MenuItem>
                            ))}

                            <SignOutWrapper>
                                <Button priority="secondary" onClick={handleSignOut} className="w-fit !shadow-[inset_0_0_0_1px_#dddddd]">
                                    <div className="flex px-4 gap-2">
                                        <i className="fr-icon fr-icon--sm fr-icon-logout-box-r-line" aria-hidden="true" />
                                        Se déconnecter
                                    </div>
                                </Button>
                            </SignOutWrapper>
                        </MenuPanel>
                    )}
                </div>

            </DropdownContainer>
        </div>
    );
}
