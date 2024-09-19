"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";
import { styled } from "@mui/material";
import SearchBar from "../search/SearchBar";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import { Theme } from "@prisma/client";
import { apiClient } from "@/lib/api-client";


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
	if (!user) return ""

	return (
		<div className="flex flex-row items-center">

			<MainNavigation
				className="w-full"
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
					{
						linkProps: {
							href: '/prof/mes-cours',
							target: '_self'
						},
						text: 'Création de cours'
					}
				]}
			/>
			{pathname != "/" &&
				<div className="absolute right-24 max-w-[30rem]">
					<SearchBar />
				</div>
			}
		</div>
	);

}