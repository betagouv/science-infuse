"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { useSelectedLayoutSegment } from "next/navigation";

export function Navigation() {

	const segment = useSelectedLayoutSegment();

	return (
		<MainNavigation
			items={[
				{
					"text": "Home",
					"linkProps": {
						"href": "/"
					},
					"isActive": segment === null
				},
				{
					"text": "Recherche sémantique",
					"linkProps": {
						"href": "/search"
					},
					"isActive": segment === "search"
				},
				{
					"text": "Ajouter un média",
					"linkProps": {
						"href": "/upload"
					},
					"isActive": segment === "upload"
				},
				{
					"text": "Science Infuse",
					"linkProps": {
						"href": "https://beta.gouv.fr/startups/scienceinfuse.html"
					}
				}
			]}
		/>
	);

}