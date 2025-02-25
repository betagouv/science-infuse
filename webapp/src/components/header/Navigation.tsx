"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { usePathname, useSelectedLayoutSegment, useSelectedLayoutSegments } from "next/navigation";
import { useSession } from "next-auth/react";
import { styled } from "@mui/material";
import SearchBar from "../search/SearchBar";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import { Theme } from "@prisma/client";
import { apiClient } from "@/lib/api-client";
import { isActive } from "@tiptap/core";


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
		width: 100%;
		@media (min-width: 768px) {
			width: auto;
		}
	}

	.fr-nav__item:first-child {
		/* margin-left: 2rem; */
	}
	/* .fr-nav__item:last-child {
		margin-left: auto !important;
		z-index: 1;
		a.fr-nav__link:hover {
			background-color: unset !important;
		}
	} */
`


const NavBarSearch = () => {
	const pathname = usePathname()
	const { data: session } = useSession();

	if (pathname === "/") {
		return null
	}

	return (
		<div className="min-w-[30rem]">
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


	const segments = useSelectedLayoutSegments();
	console.log("SEGMENT", segments)

	return (
		<div className="flex flex-row items-center">

			<StyledMainNavigation
				className="w-full flex"
				items={[
					{
						isActive: segments[0] == 'catalogue' || segments.join('/') == 'prof/mes-cours',
						text: 'Cours',
						menuLinks: [...themes.map(t => ({
							linkProps: {
								href: `/catalogue/${t.id}`
							},
							isActive: segments.join('/') == `catalogue/${t.id}`,
							text: t.title || "Theme"
						})),
						...(!user ? [] : [
							{
								isActive: segments.join('/') == 'prof/mes-cours',
								linkProps: {
									href: '/prof/mes-cours',
									target: '_self'
								},
								text: 'Création de cours'
							}
						]),
					]
					},
					
					{
						isActive: segments.join('/') == 'webinaires',
						menuLinks: [{
							linkProps: {
								href: `/webinaires`
							},
							isActive: segments.join('/') == 'webinaires',
							text: "Webinaires Ada"
						},{
							linkProps: {
								href: `#`
							},
							text: "Contenus favoris de la communauté Ada (à venir)"
						}],
						text: `Inspirations`
					},
					...(user ? [{
						isActive: segments.join('/') == 'intelligence-artificielle/video-interactive',
						linkProps: {
							href: '/intelligence-artificielle/video-interactive',
							target: '_self'
						},
						text: `Création de vidéo interactive`
					}] : []),
					{
						isActive: segments.join('/') == 'besoin-d-aide',
						linkProps: {
							href: '/besoin-d-aide',
							target: '_self'
						},
						text: `Aide`
					},
				]}
			/>
			<NavBarSearch />
		</div>
	);

}