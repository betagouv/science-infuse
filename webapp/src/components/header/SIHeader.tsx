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
      className="z-[1]"
      brandTop={<>MINISTÈRE DE
        <br />LA CULTURE</>}
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
      serviceTagline={<>Contenus multimédias gratuit <br />par la Cité des Sciences et le Palais de la Découverte"</>}
      // serviceTagline="Création de cours pour les enseignants de SVT au collège"
      navigation={<Navigation />}
    />
  )
}