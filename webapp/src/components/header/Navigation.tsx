"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { usePathname, useSelectedLayoutSegment, useSelectedLayoutSegments } from "next/navigation";
import { useSession } from "next-auth/react";
import { styled, Tooltip } from "@mui/material";
import SearchBar from "../search/SearchBar";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import { Theme, UserRoles } from "@prisma/client";
import { apiClient } from "@/lib/api-client";
import { isActive } from "@tiptap/core";
import { LockIcon } from "lucide-react";


const StyledMainNavigation = styled(MainNavigation)`
	background: red Im !important;
	.fr-nav__list {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;

		@media (min-width: 992px) {
			flex-direction: row;
			flex-grow: 1;
			align-items: center;
		}
	}

	.fr-nav__item {
		width: 100%;
		@media (min-width: 992px) {
			width: auto;
		}
	}

	.fr-nav {
		width: 100%;
	}

	#navBarSearchContainer {
		width: 100%;
		@media (min-width: 992px) {
			width: auto;
		}
	}
`


const NavBarSearch = () => {
	const pathname = usePathname()
	const { data: session } = useSession();

	if (pathname === "/" || pathname === '/connexion') {
		return null
	}

	return (
		<div id="navBarSearchContainer" className="w-full lg:w-auto lg:min-w-[30rem]">
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

	return (
		<div className="flex flex-col w-full lg:flex-row lg:items-center">
			<StyledMainNavigation
				className="w-full"
				id="navigation"
				items={[
					{
						isActive: segments[0] == 'catalogue',
						text: 'Cours',
						menuLinks: [
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
							{
								linkProps: {
									href: `/catalogue`
								},
								isActive: segments.join('/') == `catalogue/svt`,
								text: `Catalogue de cours SVT / Collège`
							},

						]
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
						isActive: segments.join('/') == 'webinaires',
						menuLinks: [{
							linkProps: {
								href: `/webinaires`
							},
							isActive: segments.join('/') == 'webinaires',
							text: "Webinaires Ada"
						}, {
							linkProps: {
								href: `#`
							},
							text: "Contenus favoris de la communauté Ada (à venir)"
						}],
						text: `Inspirations`
					},
					{
						isActive: segments.join('/') == 'besoin-d-aide',
						linkProps: {
							href: '/besoin-d-aide',
							target: '_self'
						},
						text: `Aide`
					},
					...(user && user.roles?.includes(UserRoles.BETA_TESTER) ? [{
						isActive: segments.join('/') == 'intelligence-artificielle/chatbot',
						linkProps: {
							href: '/intelligence-artificielle/chatbot',
							target: '_self',
						},
						text: <Tooltip title="Réservé aux bêta-testeurs"><span className="flex items-center justify-center gap-2">Chatbot <LockIcon size={12} /></span></Tooltip>
					}] : []),

				]}
			/>
			<NavBarSearch />
		</div>
	);

}