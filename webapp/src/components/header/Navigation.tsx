"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";
import { styled } from "@mui/material";
import SearchBar from "../search/SearchBar";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import { Theme } from "@prisma/client";
import { apiClient } from "@/lib/api-client";


const StyledMainNavigation = styled(MainNavigation)`
	.fr-nav__list {
		width: 100%;
		display: flex;
		align-items: center;
	}

	.fr-nav {
		width: 100%;
	}

	.fr-nav__item {
		width: auto;
	}

	.fr-nav__item:first-child {
		/* margin-left: 2rem; */
	}
	.fr-nav__item:last-child {
		margin-left: auto !important;
		z-index: 1;
		a.fr-nav__link:hover {
			background-color: unset !important;
		}
	}
`


const NavBarSearch = () => {
	const pathname = usePathname()
    const { data: session } = useSession();

	if (pathname === "/") {
		return null
	}

	return (
		<div className="w-full min-w-[30rem]">
			<SearchBar />
		</div>
	)
}

export function Navigation() {

	const { data: session } = useSession();
	const user = session?.user;
	const pathname = usePathname();

	const [themes, setThemes] = useState<Theme[]>([])

	useEffect(() => {
		const fetchThemes = async () => {
			try {
				const fetchedThemes = await apiClient.getThemes();
				setThemes(fetchedThemes);
			} catch (error) {
				console.error("Error fetching themes:", error);
			}
		};

		fetchThemes();

	}, [])


	const segment = useSelectedLayoutSegment();

	return (
		<div className="flex flex-row items-center">

			<StyledMainNavigation
				className="w-full flex "
				items={[
					{
						isActive: false,
						text: 'Catalogue de cours',
						menuLinks: themes.map(t => ({
							linkProps: {
								href: `/catalogue/${t.id}`
							},
							text: t.title || "Theme"
						}))
					},
					...(!user ? [] : [
						{
							linkProps: {
								href: '/prof/mes-cours',
								target: '_self'
							},
							text: 'Création de cours'
						}
					]),
					{
						linkProps: {
							href: '/webinaires',
							target: '_self'
						},
						text: `Webinaires`
					},
					{
						linkProps: {
							href: '/besoin-d-aide',
							target: '_self'
						},
						text: `Besoin d'aide`
					},
					{
						linkProps: {
							href: '#',
							target: "_self",
							className: "ml-auto w-full"
						},
						text: <NavBarSearch />
					}
				]}
			/>
		</div>
	);

}