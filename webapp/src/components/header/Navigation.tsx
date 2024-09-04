"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";
import { styled } from "@mui/material";
import SearchBar from "../search/SearchBar";


export function Navigation() {

	const { data: session } = useSession();
	const user = session?.user;
	const pathname = usePathname();
	console.log("pathname", pathname)

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
						menuLinks: [
							{
								linkProps: {
									href: '#'
								},
								text: `La planète Terre, l'environnement et l'action humaine`
							},
							{
								linkProps: {
									href: '#'
								},
								text: `Le vivant et son évolution`
							},
							{
								linkProps: {
									href: '#'
								},
								text: `Le corps humain et la santé`
							},
						],

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