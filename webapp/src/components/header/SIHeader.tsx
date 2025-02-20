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
      serviceTitle={<p className="text-xl text-[#161616]">
        <span className="font-thin">Science Infuse devient </span>
        <span className="font-bold">Ada</span>
      </p>}
      serviceTagline={<p className="text-sm text-left text-[#3a3a3a]">
        Contenus multimédias gratuits
        <br />
        par la Cité des sciences et de l'industrie et le Palais de la découverte
      </p>}      // serviceTagline="Création de cours pour les enseignants de SVT au collège"
      navigation={<Navigation />}
    />
  )
}