import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decodeJwt } from "jose";
/**
 * Ce endpoint gère les requêtes de déconnexion OIDC Back-Channel initiées par le GAR.
 * Le GAR enverra une requête POST ici avec un `logout_token`.
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[GAR-SLO] Requête de déconnexion OIDC reçue.");

    // 1. Extraire les données du formulaire de la requête
    const formData = await req.formData();
    const logoutToken = formData.get("logout_token");

    if (typeof logoutToken !== "string") {
      console.error("[GAR-SLO] logout_token manquant ou invalide.");
      return NextResponse.json({ error: "logout_token is required" }, { status: 400 });
    }
    
    // 2. Décoder le JWT
    // TODO: check signature
    const payload = decodeJwt(logoutToken);
    console.log("[GAR-SLO] decoded jwt payload", payload);    

    // 3. Extraire le 'sid' (Session ID) du payload du token
    const sid = payload.sid as string | undefined;

    if (!sid) {
      console.error("[GAR-SLO] Le 'sid' (Session ID) est introuvable dans le logout_token.");
      return NextResponse.json({ error: "sid missing from token" }, { status: 400 });
    }

    console.log(`[GAR-SLO] Session ID (sid) à révoquer : ${sid}`);

    // 4. Ajouter le sid à notre blocklist dans la base de données.
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 6); // Durée de vie max de la session GAR

    await prisma.revokedSamlSession.create({
      data: {
        sessionIndex: sid,
        expiresAt,
      },
    });

    console.log(`[GAR-SLO] Session (sid) ${sid} ajoutée à la blocklist.`);

    // 5. Répondre au GAR. Pour le back-channel logout, une réponse 200 OK suffit.
    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("[GAR-SLO] Erreur lors du traitement de la requête de déconnexion:", error);
    // Masquer les détails de l'erreur en production
    const errorMessage = error instanceof Error ? error.message : "Erreur interne.";
    return NextResponse.json({ status: "error", message: errorMessage }, { status: 500 });
  }
}

