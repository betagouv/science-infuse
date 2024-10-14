import Header from "@codegouvfr/react-dsfr/Header"
import { Navigation } from "./Navigation"
import { Session } from 'next-auth'
import ConnectedHeader from "./ConnectedHeader";
import React from "react";

interface ClientHeaderProps {
  session: Session | null;
}

export default function ClientHeader({ session }: ClientHeaderProps) {

  return (
    <Header
      className=""
      brandTop={<>RÉPUBLIQUE
        <br />FRANÇAISE</>}
      operatorLogo={{
        alt: 'logo science infuse',
        imgUrl: '/images/science_infuse_logo.jpg',
        // imgUrl: '/images/science_infuse_logo.svg',
        orientation: 'horizontal'
      }}
      quickAccessItems={[<ConnectedHeader key="connected-header" />]}
      homeLinkProps={{
        "href": "/",
        "title": "Accueil - Science Infuse"
      }}
      serviceTitle="Science Infuse"
      serviceTagline="Création de cours pour les enseignants de SVT au collège"
      navigation={<Navigation />}
    />
  )
}