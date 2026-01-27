import { z } from "zod";
import { type Message, type ToolExecutionOptions, convertToCoreMessages, streamText } from "ai";
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { mistral } from '@ai-sdk/mistral';
import { getEmbeddings } from "@/lib/utils/embeddings";
import { searchDocumentChunks } from "../search/sql_raw_queries";
import { apiClient } from "@/lib/api-client";
import { withAccessControl } from "../accessControl";
import { NextRequest } from "next/server";

function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}


// export async function POST(req: Request) {
export const POST = withAccessControl(
  { allowedRoles: ['*'] },
  async (req: NextRequest) => {
    const { system, messages } = (await req.json()) as {
      system: string;
      messages: Message[];
    };

    const userSystemPrompt = system ? `### **Informations supplementaires fournies par l'utilisateur du chatbot**\n${system}` : undefined;
    const result = await streamText({
      model: groq('moonshotai/kimi-k2-instruct-0905'),
      // model: openai('gpt-4o-2024-08-06'),
      // model: groq('llama-3.3-70b-specdec'),
      // model: mistral('mistral-large-latest'),
      // model: google('gemini-2.0-flash-001'),
      system: `Tu es un professeur de SVT pour le collège et le lycée.  
Tu disposes d’outils de recherche te permettant de retrouver et d’afficher des documents pour répondre aux questions des utilisateurs de manière précise et pédagogique.

### **🛠 Outils mis à ta disposition :**  
- \`search_content\`: Recherche des documents (PDFs, images, vidéos...) dans une base de données vectorielle.  
- \`display_document_chunks\`: Affiche un ou plusieurs documents à partir de leurs identifiants.  
- \`get_document_chunk_full_text\`: Récupère le texte complet d’un extrait de document si plus d’informations sont nécessaires.  
- \`display_sources_to_user(source_ids)\`: Affiche les sources utilisées pour formuler la réponse.  

### **🔍 Règles de recherche et d'affichage :**  
- **Toujours commencer par rechercher des documents** avec \`search_content\` avant de répondre.  
- Analyser les résultats en se basant sur leur attribut \`text\` pour sélectionner les plus pertinents.  
- Si les résultats ne fournissent pas assez d’informations, utiliser \`get_document_chunk_full_text\` pour obtenir plus de contenu.  
- **Ne rien inventer**, formuler les réponses uniquement à partir des informations trouvées dans les documents.  
- N'afficher que les documents réellement utiles, en privilégiant les images et vidéos si elles apportent un complément visuel pertinent.
- N'affiche pas les pdfs  
- **Toujours afficher les sources utilisées** avec \`display_sources_to_user\` après avoir répondu.  

### **📝 Règles de réponse :**  
- Structurer la réponse en s’appuyant sur les documents, images et vidéos trouvés.
- Utiliser du **markdown** pour organiser l’information (titres, sous-titres, listes…).  
- Afficher les documents / médias pertinents avec \`display_document_chunks\`, puis poursuivre l’explication si nécessaire.  
- **Toujours afficher les sources** utilisées via \`display_sources_to_user\`.  
- **Ne jamais mentionner explicitement les étapes de recherche** à l’utilisateur, répondre directement avec le contenu trouvé. Si aucun contenu n'est trouvé, dis le.

${userSystemPrompt}
`,
      messages: messages,
      maxSteps: 20,
      tools: {
        search_content: {
          description: "Search document chunks in the semantic database.",
          parameters: z.object({
            query: z.string(),
            mediaTypes: z.array(z.enum([
              "image",
              "text",
              "video",
            ])).optional(),
          }),
          execute: async (args) => {

            // Map the simplified media types to detailed ones
            const mappedMediaTypes = Array.from(new Set((args.mediaTypes || []).flatMap((type: string) => {
              switch (type) {
                case 'image':
                  return ['image', 'pdf_image', 'raw_image'];
                case 'text':
                  return ['pdf_text', 'website', 'website_qa', 'website_experience'];
                case 'video':
                  return ['video_transcript'];
                default:
                  return [];
              }
            }))) as string[]

            const { query } = args;
            const searchResult = await apiClient.search({ query, filters: { limit: 15, mediaTypes: mappedMediaTypes } })
            const chunks = searchResult.chunks
            const response = `
Voici des resultats de recherche pour le terme "${query}".
Répond uniquement en affichant les trois documents les plus pertinents grâce à la fonction display_document_chunks({documents: [{id: xxx}, {id: yyy}]}).
           ${JSON.stringify(chunks.map(c => ({ chunk_id: c.id, mediaType: c.mediaType, document_title: c.document.mediaName, relevence_score: c.score, text: c.text.slice(0, 1000) })), null, 2)}`;
            console.log("search_content", args)
            return response
          }
        },
        display_document_chunks: {
          description: "Show one or more document chunk to the user.",
          parameters: z.object({
            documents: z.array(
              z.object({
                id: z.string(),
              })
            )
          }),
          execute: async (args) => {
            console.log("display_document_chunks", args)
            return "Only if necessary you can continue writing text after this."
          }
        },
        display_sources_to_user: {
          description: "Display the sources used to formulate the response",
          parameters: z.object({
            documents: z.array(
              z.object({
                id: z.string(),
              })
            )
          }),
          execute: async (args) => {
            return "Only if necessary you can continue writing text after this."
          }
        },
        get_document_chunk_full_text: {
          description: "Get  full text",
          parameters: z.object({
            id: z.string(),
          }),
          execute: async (args) => {
            const chunk = await apiClient.getChunk(args.id)
            console.log("get_document_chunk_full_text", chunk.id, chunk.text.slice(0, 50))
            return chunk.text
          }
        },

      }
    });

    return result.toDataStreamResponse({
      getErrorMessage: errorHandler
    });
  });