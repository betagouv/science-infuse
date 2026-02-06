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

    // Simple PNG dimension detection
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    // Simple JPEG dimension detection
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

    // Default fallback
    return { width: 800, height: 600 };
  } catch (error) {
    console.error('Error reading image dimensions:', error);
    return { width: 800, height: 600 };
  }
}
export default async (input: ImageACompleterData, h5pContentId?: string) => {
  const chunk = await prisma.documentChunk.findUnique({
    where: {
      id: input.chunkId
    },
    select: {
      id: true,
      metadata: true
    }
  })
  if (!chunk) {
    throw new Error(`Chunk not found for id: ${input.chunkId}`);
  }
  const metadata = chunk.metadata as { s3ObjectName?: string } | null;
  const s3ObjectName = metadata?.s3ObjectName;
  if (!s3ObjectName) {
    throw new Error(`No image found in chunk: ${input.chunkId}`);
  }
  // Get public URL and image dimensions
  const imageUrl = s3ToPublicUrl(s3ObjectName);
  const imageDimensions = await getImageDimensions(imageUrl);
  console.log("IMAGEDIMENSIONS", imageDimensions)
  // H5P DragQuestion uses a canvas with the background image
  // The canvas size should match the image for simplicity
  // All x,y positions are percentages (0-100) of this canvas
  // Width/height for elements and dropzones are in em (relative to font-size, default scaled to 16px base)
  const canvasWidth = imageDimensions.width;
  const canvasHeight = imageDimensions.height;
  const baseFontSize = 16; // Base font size in px used for em calculations

  // Drop zones on the image (positions in %, sizes in em)
  // bbox are normalized 0-1, convert to % for positions, and em for sizes
  // em = (fraction * dimension_px) / baseFontSize
  const dropZones = input.boxes.map((box, index) => ({
    x: box.bbox.x1 * 100,
    y: box.bbox.y1 * 100,
    width: (box.bbox.x2 - box.bbox.x1) * canvasWidth / baseFontSize,
    height: (box.bbox.y2 - box.bbox.y1) * canvasHeight / baseFontSize,
    correctElements: [index.toString()],
    showLabel: false,
    label: box.label, // For accessibility
    backgroundOpacity: 0,
    tipsAndFeedback: {
      tip: "",
      feedbackOnCorrect: "Correct !",
      feedbackOnIncorrect: "Incorrect."
    },
    single: true,
    autoAlign: false
  }));

  // Draggable text elements positioned at the bottom in a grid
  // Allow dropping any label on any drop zone to enable mistakes and scoring
  // Positions in %, sizes in em
  const elementsPerRow = Math.min(input.boxes.length, 4); // Max 4 per row for readability
  const numRows = Math.ceil(input.boxes.length / elementsPerRow);

  // Desired percentages for layout (adjust as needed)
  const desiredElementHeightPercent = 5; // ~5% of canvas height per element
  const verticalSpacingPercent = 5; // 6% vertical spacing between rows
  const bottomMarginPercent = 6; // Small margin at bottom

  const totalElementsHeightPercent = numRows * desiredElementHeightPercent + (numRows - 1) * verticalSpacingPercent;
  const startY = 100 - totalElementsHeightPercent - bottomMarginPercent;
  
  // For variable widths
  const charWidthEmAt1 = 0.34;
  const fontSizeFactor = 0.5125;
  const perCharEm = charWidthEmAt1 * fontSizeFactor;
  const paddingEm = 0.25;
  const minWidthEm = 2;
  const spacingPercent = 4; // Increased spacing between elements
  const rowMarginPercent = 2; // Reduced margin on each side, total 4%

  // Group boxes into rows
  const rows: ImageACompleterBox[][] = [];
  for (let r = 0; r < numRows; r++) {
    rows.push(input.boxes.slice(r * elementsPerRow, (r + 1) * elementsPerRow));
  }

  const elements = rows.flatMap((row, r) => {
    const rowWidthsEm = row.map(box => {
      const labelLength = box.label.length;
      return Math.max(minWidthEm, labelLength * perCharEm + paddingEm);
    });

    let rowWidthsPercent = rowWidthsEm.map(wEm => (wEm * baseFontSize / canvasWidth) * 100);

    let totalContentWidthPercent = rowWidthsPercent.reduce((a, b) => a + b, 0);
    let totalSpacingPercent = (row.length - 1) * spacingPercent;
    let totalRowPercent = totalContentWidthPercent + totalSpacingPercent;

    let scale = 1;
    const availableWidthPercent = 100 - 2 * rowMarginPercent;
    if (totalRowPercent > availableWidthPercent) {
      scale = availableWidthPercent / totalRowPercent;
      rowWidthsPercent = rowWidthsPercent.map(w => w * scale);
      totalContentWidthPercent *= scale;
      totalSpacingPercent *= scale;
      totalRowPercent = totalContentWidthPercent + totalSpacingPercent;
    }

    const startX = rowMarginPercent + (availableWidthPercent - totalRowPercent) / 2; // center the row
    let currentX = startX;

    return row.map((box, c) => {
      const widthPercent = rowWidthsPercent[c];
      const widthEm = (widthPercent / 100 * canvasWidth) / baseFontSize;
      const elementHeightEm = (desiredElementHeightPercent / 100 * canvasHeight) / baseFontSize;
      const y = startY + r * (desiredElementHeightPercent + verticalSpacingPercent);
      const label = box.label.replace(/\s+/g, '&nbsp;');
      const index = r * elementsPerRow + c;

      const element = {
        x: currentX,
        y,
        width: widthEm,
        height: elementHeightEm,
        dropZones: input.boxes.map((_, i) => i.toString()), // Can drop on any drop zone
        type: {
          library: "H5P.AdvancedText 1.1",
          params: {
            text: `<p style="text-align: center; margin: 0; padding: 0.25em; font-size: 0.4125em; line-height: 1em;">${label}</p>`
          },
          subContentId: `element-${index}`,
          metadata: {
            contentType: "Text",
            license: "U",
            title: box.label,
            authors: [],
            changes: []
          }
        },
        backgroundOpacity: 100, // Solid background for draggables
        multiple: false
      };

      currentX += widthPercent + spacingPercent;
      return element;
    });
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
              "mime": "image/png", // Assume PNG, adjust if needed
              "copyright": {
                "license": "U"
              },
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
          {
            "from": 0,
            "to": 49,
            "feedback": "Essaie encore !"
          },
          {
            "from": 50,
            "to": 99,
            "feedback": "Bien, mais tu peux faire mieux !"
          },
          {
            "from": 100,
            "to": 100,
            "feedback": "Parfait !"
          }
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
        "grabbablePrefix": "Grabbable {num} of {total}.",
        "grabbableSuffix": "Placed in dropzone {num}.",
        "dropzonePrefix": "Dropzone {num} of {total}.",
        "noDropzone": "No dropzone.",
        "tipLabel": "Show tip.",
        "tipAvailable": "Tip available",
        "correctAnswer": "Correct answer",
        "wrongAnswer": "Wrong answer",
        "feedbackHeader": "Feedback",
        "scoreBarLabel": "You got :num out of :total points",
        "scoreExplanationButtonLabel": "Show score explanation",
        "a11yCheck": "Check the answers. The responses will be marked as correct, incorrect, or unanswered.",
        "a11yRetry": "Retry the task. Reset all responses and start the task over again.",
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