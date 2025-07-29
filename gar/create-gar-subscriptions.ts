import axios, { AxiosError } from 'axios';
import fs from 'fs';
import https from 'https';

// --- CONFIGURATION À PERSONNALISER ---
const GAR_BASE_URL_PFPART = 'https://abonnement.partenaire.test-gar.education.fr';
const ID_RESSOURCE_ADA = 'ark:/20521/Ada20250415.pp';
const ID_DISTRIBUTEUR_COMMERCIAL = '519587851_0000000121463256';


const CERT_PATH = './certs/certificat_gar.pem';
const KEY_PATH = './certs/cle_privee_gar.key';

const DEBUT_VALIDITE_ANNEE_SCOLAIRE = '2025-09-01T00:00:00';
const FIN_VALIDITE_ANNEE_SCOLAIRE = '2026-08-31T23:59:59';
const ANNEE_FIN_VALIDITE_ANNEE_SCOLAIRE_STR = '2025-2026'; // Format "AAAA-AAAA"

// --- Chargement des certificats et configuration Axios ---
const cert = fs.readFileSync(CERT_PATH);
const key = fs.readFileSync(KEY_PATH);

const httpsAgent = new https.Agent({
  cert: cert,
  key: key,
});

const axiosGAR = axios.create({
  baseURL: GAR_BASE_URL_PFPART,
  httpsAgent: httpsAgent,
  headers: {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml, application/json'
  },
  transformResponse: [(data) => data]
});

async function creerAbonnementGAR(abonnementId: string, uaiEtab: string, libelleEtab: string) {
  const xmlBody = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<abonnement xmlns="http://www.atosworldline.com/wsabonnement/v1.0/">
    <idAbonnement>${abonnementId}</idAbonnement>
    <commentaireAbonnement>Abonnement de test pour qualification de conformité GAR - ${libelleEtab}</commentaireAbonnement>
    <idDistributeurCom>${ID_DISTRIBUTEUR_COMMERCIAL}</idDistributeurCom>
    <idRessource>${ID_RESSOURCE_ADA}</idRessource>
    <typeIdRessource>ark</typeIdRessource>
    <libelleRessource>ADA - Ma ressource de test</libelleRessource>
    <debutValidite>${DEBUT_VALIDITE_ANNEE_SCOLAIRE}</debutValidite>
    <anneeFinValidite>${ANNEE_FIN_VALIDITE_ANNEE_SCOLAIRE_STR}</anneeFinValidite>
    <uaiEtab>${uaiEtab}</uaiEtab>
    <typeAffectation>INDIV</typeAffectation>
    <nbLicenceGlobale>ILLIMITE</nbLicenceGlobale>
    <publicCible>ELEVE</publicCible>
    <publicCible>ENSEIGNANT</publicCible>
    <publicCible>AUTRE PERSONNEL</publicCible>
    <publicCible>DOCUMENTALISTE</publicCible>
</abonnement>`;

  console.log(`Envoi de l'abonnement pour ${libelleEtab} avec ID: ${abonnementId}`);
  try {
    const response = await axiosGAR.put(`/${abonnementId}`, xmlBody);
    console.log(`Succès pour ${libelleEtab}. Statut HTTP: ${response.status}`);
    console.log("Réponse de l'API GAR:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Échec pour ${libelleEtab} avec ID ${abonnementId}.`);
    if (error.response) {
      console.error("Statut HTTP:", error.response.status);
      console.error("Réponse d'erreur de l'API GAR:", error.response.data);
    } else {
      console.error("Message d'erreur:", error.message);
    }
    throw error;
  }
}

// --- Execution of calls for test establishments ---
(async () => {
  if (ID_DISTRIBUTEUR_COMMERCIAL === 'VOTRE_ID_DISTRIBUTEUR_COMMERCIAL' || ID_RESSOURCE_ADA === 'VOTRE_ID_RESSOURCE_GAR_POUR_ADA') {
    console.error("ERREUR: Veuillez renseigner ID_DISTRIBUTEUR_COMMERCIAL et ID_RESSOURCE_ADA dans le script.");
    return;
  }

  const etablissementsDeTest = [
    { uai: '0015679O', libelle: 'LGT-DU LEON-LANDIVISIAU' },
    { uai: '0010138R', libelle: 'CLG GWEN-HALOU-CALLAC' }
  ];

  for (const etablissement of etablissementsDeTest) {
    // Generate a unique subscription ID for each call
    // Use part of the idRessource to make it shorter and more readable in the subscription ID
    const idRessourceShort = ID_RESSOURCE_ADA.substring(ID_RESSOURCE_ADA.lastIndexOf('/') + 1);
    const abonnementId = `${idRessourceShort}-${etablissement.uai}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-TEST`;
    
    try {
      await creerAbonnementGAR(abonnementId, etablissement.uai, etablissement.libelle);
    } catch (e) {
      // The error is already logged in the creerAbonnementGAR function
    }
  }

  console.log("\nProcessus de création d'abonnements de test terminé.");
  console.log("If all requests were successful, you can now inform Elsa that the test subscriptions have been created.");
})();