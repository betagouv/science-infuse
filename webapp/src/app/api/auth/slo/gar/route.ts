import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DOMParser } from "@xmldom/xmldom";
import xpath from "xpath";

/**
 * Ce endpoint gère les requêtes de Single Logout (SLO) initiées par le GAR.
 * Le GAR enverra une requête POST ici lorsqu'un utilisateur se déconnecte de son ENT.
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[GAR-SLO] Requête de déconnexion reçue.");

    const body = await req.text();

    // 1. Parser le corps de la requête XML (qui est une enveloppe SOAP)
    const doc = new DOMParser().parseFromString(body);

    // 2. Définir les namespaces pour pouvoir requêter le XML avec XPath
    const select = xpath.useNamespaces({
      "saml2p": "urn:oasis:names:tc:SAML:2.0:protocol",
      "saml2": "urn:oasis:names:tc:SAML:2.0:assertion"
    });

    // 3. Extraire le SessionIndex
    // C'est l'identifiant de session que le GAR nous a donné lors de la connexion initiale.
    const sessionIndexNode = select("//saml2p:SessionIndex/text()", doc, true) as Node;

    if (!sessionIndexNode || !sessionIndexNode.nodeValue) {
      console.error("[GAR-SLO] SessionIndex introuvable dans la requête SAML.");
      return NextResponse.json({ status: "error", message: "SessionIndex manquant." }, { status: 400 });
    }

    const sessionIndex = sessionIndexNode.nodeValue;
    console.log(`[GAR-SLO] SessionIndex à révoquer : ${sessionIndex}`);

    // 4. Ajouter le SessionIndex à notre "blocklist" dans la base de données.
    // Tout JWT portant ce SessionIndex sera considéré comme invalide.
    // Nous ajoutons une date d'expiration par sécurité (basée sur la durée max de session GAR).
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6); // Durée de vie max de la session GAR (cf. doc)

    await prisma.revokedSamlSession.create({
      data: {
        sessionIndex,
        expiresAt,
      },
    });

    console.log(`[GAR-SLO] SessionIndex ${sessionIndex} ajouté à la blocklist.`);

    // 5. Répondre au GAR.
    // Une réponse SAML LogoutResponse est normalement attendue.
    // Pour l'instant, nous renvoyons une réponse 200 OK pour accuser réception.
    // Une librairie SAML complète vous aidera à construire une LogoutResponse valide.
    const samlLogoutResponse = `
    <soap11:Envelope xmlns:soap11="http://schemas.xmlsoap.org/soap/envelope/">
      <soap11:Body>
        <saml2p:LogoutResponse xmlns:saml2p="urn:oasis:names:tc:SAML:2.0:protocol"
                               ID="_some_random_id"
                               Version="2.0"
                               IssueInstant="${new Date().toISOString()}"
                               Destination="${process.env.GAR_ISSUER}/logout">
          <saml2:Issuer xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion">${process.env.NEXTAUTH_URL}</saml2:Issuer>
          <saml2p:Status>
            <saml2p:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>
          </saml2p:Status>
        </saml2p:LogoutResponse>
      </soap11:Body>
    </soap11:Envelope>
    `.trim();

    return new NextResponse(samlLogoutResponse, {
        status: 200,
        headers: { "Content-Type": "application/xml" },
    });


  } catch (error) {
    console.error("[GAR-SLO] Erreur lors du traitement de la requête de déconnexion:", error);
    return NextResponse.json({ status: "error", message: "Erreur interne du serveur." }, { status: 500 });
  }
}
