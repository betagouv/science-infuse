import prisma from "@/lib/prisma";
import { createH5P } from "."
import { ImageACompleterBox } from "@/app/(main)/intelligence-artificielle/image-a-completer/ImageACompleterEditor";
import { s3ToPublicUrl } from "@/types/vectordb";

export interface ImageACompleterData {
  boxes: ImageACompleterBox[]
  chunkId: string;
}

async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        if (marker === 0xC0 || marker === 0xC2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
      }
    }

    return { width: 800, height: 600 };
  } catch (error) {
    console.error('Error reading image dimensions:', error);
    return { width: 800, height: 600 }; // Fallback
  }
}

// Fonction de sécurité pour bloquer les coordonnées entre 0 et 1 (0% et 100%)
const clamp = (val: number) => Math.max(0, Math.min(1, val));

export default async (input: ImageACompleterData, h5pContentId?: string) => {
  const chunk = await prisma.documentChunk.findUnique({
    where: { id: input.chunkId },
    select: {
      id: true,
      metadata: true,
      document: {
        select: {
          publicPath: true
        }
      }
    }
  });

  if (!chunk) throw new Error(`Chunk not found for id: ${input.chunkId}`);
  
  const metadata = chunk.metadata as { s3ObjectName?: string; publicPath?: string } | null;
  const imageUrl = metadata?.s3ObjectName
    ? s3ToPublicUrl(metadata.s3ObjectName)
    : metadata?.publicPath || chunk.document.publicPath;

  if (!imageUrl) throw new Error(`No image found in chunk: ${input.chunkId}`);
  const imageDimensions = await getImageDimensions(imageUrl);
  
  // 1. Filtrer les boîtes invalides (misclicks frontend ou dimensions nulles)
  const validBoxes = input.boxes.filter(box => {
      const w = clamp(box.bbox.x2) - clamp(box.bbox.x1);
      const h = clamp(box.bbox.y2) - clamp(box.bbox.y1);
      return w > 0.01 && h > 0.01; // Ignorer les zones trop petites/invalides
  });

  if (validBoxes.length === 0) {
      throw new Error("Aucune zone valide n'a été fournie pour générer l'H5P.");
  }

  // 2. Normalisation de la vue pour une UX de grille parfaite 
  const TARGET_WIDTH = 800;
  const scaleToTarget = TARGET_WIDTH / imageDimensions.width;
  const canvasWidth = TARGET_WIDTH;
  const canvasHeight = Math.round(imageDimensions.height * scaleToTarget);
  const BASE_FONT_SIZE = 16; 

  const maxRowWidthEm = (canvasWidth / BASE_FONT_SIZE) - 2; 
  
  const draggables = validBoxes.map((box, index) => {
    const labelText = box.label || `Zone ${index + 1}`;
    const estimatedWidthEm = labelText.length * 0.55 + 1.5; 
    const widthEm = Math.min(Math.max(4.5, estimatedWidthEm), maxRowWidthEm);
    return { 
      id: index, 
      label: labelText, 
      widthEm 
    };
  });

  // Mélanger/trier pour que l'exercice ait du sens
  draggables.sort((a, b) => a.label.localeCompare(b.label));

  // 3. Algorithme de Packing (disposition en grille pour les étiquettes)
  const hGapEm = 1;
  const vGapEm = 0.5;
  const labelHeightEm = 2.2;
  const marginEm = 1;

  const rows: { items: typeof draggables, width: number }[] = [];
  let currentRow: typeof draggables = [];
  let currentRowWidth = 0;

  draggables.forEach(item => {
    if (currentRow.length === 0) {
      currentRow.push(item);
      currentRowWidth = item.widthEm;
    } else {
      if (currentRowWidth + hGapEm + item.widthEm <= maxRowWidthEm) {
        currentRow.push(item);
        currentRowWidth += hGapEm + item.widthEm;
      } else {
        rows.push({ items: currentRow, width: currentRowWidth });
        currentRow = [item];
        currentRowWidth = item.widthEm;
      }
    }
  });
  if (currentRow.length > 0) rows.push({ items: currentRow, width: currentRowWidth });

  const numRows = rows.length;
  const totalBlockHeightEm = numRows * labelHeightEm + (numRows - 1) * vGapEm;
  const startYEm = Math.max(0, (canvasHeight / BASE_FONT_SIZE) - totalBlockHeightEm - marginEm);

  const elements: any[] = [];
  const originalToNewIndex: Record<number, number> = {};

  rows.forEach((row, rIdx) => {
    const startXEm = marginEm + (maxRowWidthEm - row.width) / 2;
    let currentXEm = startXEm;
    const yEm = startYEm + rIdx * (labelHeightEm + vGapEm);

    row.items.forEach(item => {
      const xPercent = clamp((currentXEm * BASE_FONT_SIZE) / canvasWidth) * 100;
      const yPercent = clamp((yEm * BASE_FONT_SIZE) / canvasHeight) * 100;
      
      const newIndex = elements.length;
      originalToNewIndex[item.id] = newIndex; 

      elements.push({
        x: xPercent,
        y: yPercent,
        width: item.widthEm,
        height: labelHeightEm,
        dropZones: validBoxes.map((_, i) => i.toString()), 
        type: {
          library: "H5P.AdvancedText 1.1",
          params: {
            text: `<p style="text-align: center; margin: 0; padding: 0.35em 0.5em; font-size: 1em; line-height: 1.2em; color: #333;">${item.label}</p>`
          },
          subContentId: `draggable-${newIndex}`,
          metadata: {
            contentType: "Text",
            license: "U",
            title: item.label,
            authors: [],
            changes: []
          }
        },
        backgroundOpacity: 100,
        multiple: false,
        label: item.label // Important : Propriété vitale pour éviter l'erreur H5P Accessibility !
      });

      currentXEm += item.widthEm + hGapEm;
    });
  });

  // 4. Générer les DropZones sécurisées
  const dropZones = validBoxes.map((box, index) => {
    const x1 = clamp(box.bbox.x1);
    const x2 = clamp(box.bbox.x2);
    const y1 = clamp(box.bbox.y1);
    const y2 = clamp(box.bbox.y2);

    return {
      x: x1 * 100,
      y: y1 * 100,
      width: Math.max(1, (x2 - x1) * canvasWidth / BASE_FONT_SIZE), // Éviter width: 0
      height: Math.max(1, (y2 - y1) * canvasHeight / BASE_FONT_SIZE), // Éviter height: 0
      correctElements: [String(originalToNewIndex[index])], 
      showLabel: false,
      label: box.label || `Zone ${index + 1}`, // Important : Propriété vitale !
      backgroundOpacity: 0,
      tipsAndFeedback: {
        tip: "",
        feedbackOnCorrect: "Correct !",
        feedbackOnIncorrect: "Incorrect."
      },
      single: true,
      autoAlign: false
    };
  });

  const data = {
    "library": "H5P.DragQuestion 1.14",
    "params": {
      "params": {
        "scoreShow": "Vérifier",
        "submit": "Soumettre",
        "tryAgain": "Réessayer",
        "scoreExplanation": "Les bonnes réponses donnent +1 point. Les mauvaises réponses donnent -1 point. Le score minimum est 0.",
        "question": {
          "settings": {
            "size": {
              "width": canvasWidth,
              "height": canvasHeight
            },
            "background": {
              "path": imageUrl,
              "mime": "image/jpeg", 
              "copyright": { "license": "U" },
              "width": canvasWidth,
              "height": canvasHeight
            }
          },
          "task": {
            "elements": elements,
            "dropZones": dropZones
          }
        },
        "overallFeedback": [
          { "from": 0, "to": 49, "feedback": "Essaie encore !" },
          { "from": 50, "to": 99, "feedback": "Bien, mais tu peux faire mieux !" },
          { "from": 100, "to": 100, "feedback": "Parfait !" }
        ],
        "behaviour": {
          "enableRetry": true,
          "enableCheckButton": true,
          "singlePoint": false,
          "applyPenalties": true,
          "enableScoreExplanation": true,
          "dropZoneHighlighting": "dragging",
          "autoAlignSpacing": 2,
          "enableFullScreen": false,
          "showScorePoints": true,
          "showTitle": true
        },
        "grabbablePrefix": "Élément {num} sur {total}.",
        "grabbableSuffix": "Placé dans la zone {num}.",
        "dropzonePrefix": "Zone de dépôt {num} sur {total}.",
        "noDropzone": "Aucune zone de dépôt.",
        "tipLabel": "Afficher l'indice.",
        "tipAvailable": "Indice disponible",
        "correctAnswer": "Bonne réponse",
        "wrongAnswer": "Mauvaise réponse",
        "feedbackHeader": "Retour",
        "scoreBarLabel": "Vous avez obtenu :num sur :total points",
        "scoreExplanationButtonLabel": "Afficher l'explication du score",
        "a11yCheck": "Vérifier les réponses.",
        "a11yRetry": "Recommencer la tâche.",
        "localize": {
          "fullscreen": "Plein écran",
          "exitFullscreen": "Quitter le plein écran"
        }
      },
      "metadata": {
        "defaultLanguage": "fr",
        "license": "U",
        "authors": [],
        "changes": [],
        "extraTitle": " ",
        "title": " "
      }
    }
  };

  return await createH5P(data, h5pContentId);
}
