"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { styled } from "@mui/material";


export function Navigation() {

	const { data: session } = useSession();
	const user = session?.user;

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
								text: 'Lien de navigation'
							},
							{
								linkProps: {
									href: '#'
								},
								text: 'Lien de navigation'
							},
							{
								linkProps: {
									href: '#'
								},
								text: 'Lien de navigation'
							},
							{
								isActive: true,
								linkProps: {
									href: '#'
								},
								text: 'Lien de navigation'
							},
							{
								linkProps: {
									href: '#'
								},
								text: 'Lien de navigation'
							},
							{
								linkProps: {
									href: '#'
								},
								text: 'Lien de navigation'
							}
						],

					},
					{
						linkProps: {
							href: '#',
							target: '_self'
						},
						text: 'Création de cours'
					}
				]}
			/>
			<SearchBar onButtonClick={function noRefCheck() { }} />
		</div>
	);

}