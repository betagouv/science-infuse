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
      // operatorLogo={{
      //   alt: 'logo science infuse',
      //   imgUrl: '/images/science_infuse_logo.jpg',
      //   // imgUrl: '/images/science_infuse_logo.svg',
      //   orientation: 'horizontal'
      // }}
      quickAccessItems={[
        // <div key="mail" className="flex h-full items-center justify-center">
        //   <a href="/besoin-d-aide" className="fr-btn flex gap-2 !m-0 h-fit justify-center" id="fr-header-header-with-quick-access-items-quick-access-item-1">
        //     <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        //       <path fillRule="evenodd" clipRule="evenodd" d="M0.999674 -0.000488281H12.9997C13.3679 -0.000488281 13.6663 0.297989 13.6663 0.666178V11.3328C13.6663 11.701 13.3679 11.9995 12.9997 11.9995H0.999674C0.631485 11.9995 0.333008 11.701 0.333008 11.3328V0.666178C0.333008 0.297989 0.631485 -0.000488281 0.999674 -0.000488281ZM7.03967 5.78818L2.76501 2.15818L1.90167 3.17418L7.04834 7.54418L12.1023 3.17085L11.2303 2.16218L7.03967 5.78818Z" fill="#000091" />
        //     </svg>
        //     Nous contacter
        //   </a>
        // </div>,
        <ConnectedHeader key="connected-header" />]
      }
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
      </p>}
      // serviceTagline="Création de cours pour les enseignants de SVT au collège"
      navigation={<Navigation />}
    />
  )
}