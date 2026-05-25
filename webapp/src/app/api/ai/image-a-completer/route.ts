import prisma from "@/lib/prisma";
import { callGroqVision, VisionMessage } from "@/lib/server/ia/external_llm";
import { NextRequest, NextResponse } from "next/server";
import { ImageACompleterBox } from "@/app/(main)/intelligence-artificielle/image-a-completer/ImageACompleterEditor";
import { s3ToPublicUrl } from "@/types/vectordb";

async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // Determine MIME type from response headers or URL
    const contentType = response.headers.get('content-type') || 'image/png';
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

interface ParsedRegion {
  label: string;
  description: string;
  bbox: number[];
}

function parseLLMOutput(llmOutput: string): ParsedRegion[] {
  const regions: ParsedRegion[] = [];
  
  // Split by ** markers to find labels
  const blocks = llmOutput.split(/\*\*(.*?)\*\*/);
  
  // Process pairs of label and content
  for (let i = 1; i < blocks.length; i += 2) {
    const label = blocks[i]?.trim();
    const rest = blocks[i + 1];
    
    if (!label || !rest) continue;
    
    // Extract bbox
    const bboxMatch = rest.match(/<BBOX>(.*?)<\/BBOX>/);
    if (!bboxMatch) continue;
    
    const bboxStr = bboxMatch[1].trim();
    const coords = bboxStr.split(',').map(parseFloat);
    
    if (coords.length !== 4 || coords.some(isNaN)) continue;
    
    const [x1, y1, x2, y2] = coords;
    
    // Extract description
    const descMatch = rest.match(/Description:\s*([\s\S]*?)(?=\n\*\*|$)/);
    const description = descMatch?.[1]?.trim() || "";
    
    regions.push({
      label,
      description,
      bbox: [x1, y1, x2, y2]
    });
  }
  
  // Remove exact duplicate bboxes (keep first occurrence)
  const seen = new Set<string>();
  const filtered = regions.filter(r => {
    const key = r.bbox.join(',');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return filtered;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { chunkId } = await request.json();

    if (!chunkId) {
      return NextResponse.json({ error: "chunkId is required" }, { status: 400 });
    }

    // Get the chunk with document metadata
    const chunk = await prisma.documentChunk.findUnique({
      where: { id: chunkId },
      select: {
        id: true,
        metadata: true,
        document: true
      }
    });

    if (!chunk) {
      return NextResponse.json({ error: "Chunk not found" }, { status: 404 });
    }

    // Get image URL from chunk metadata. Indexed images can be S3-backed
    // (`image`, `pdf_image`) or direct public URLs (`raw_image`).
    const metadata = chunk.metadata as { s3ObjectName?: string; publicPath?: string } | null;
    const imageUrl = metadata?.s3ObjectName
      ? s3ToPublicUrl(metadata.s3ObjectName)
      : metadata?.publicPath || chunk.document.publicPath;

    if (!imageUrl) {
      return NextResponse.json({ error: "No image found in chunk" }, { status: 400 });
    }
    
    console.log('Fetching image from:', imageUrl);
    
    // Convert image to base64 data URL for Groq
    const imageDataUrl = await imageUrlToBase64(imageUrl);
    
    console.log('Image converted to base64, length:', imageDataUrl.length);

    // Prepare vision messages
    const messages: VisionMessage[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are a scientific and educational visual reasoning assistant. For the given image:\n\n- Identify all scientifically or educationally relevant regions.\n- For each region, output:\n    - The name of the region in French (label)\n    - A short description of its educational or scientific importance\n    - The bounding box in normalized coordinates (x1, y1, x2, y2)\n- Use the following format for each region:\n**<LABEL>**\n<BBOX>x1,y1,x2,y2</BBOX>\nDescription: <brief description in French>\n\n- Output one region after another.\n- Do not output anything else besides this structure."
          },
          {
            type: "image_url",
            image_url: {
              url: imageDataUrl
            }
          }
        ]
      },
    ];

    // Call Groq vision API
    const [error, output] = await callGroqVision(messages);

    if (error || !output) {
      console.error("LLM vision generation failed:", error);
      throw new Error("LLM vision generation failed");
    }

    // Parse the output
    const regions = parseLLMOutput(output);

    // Convert to ImageACompleterBox format with pixel coordinates
    // Note: We need image dimensions to convert normalized coords to pixels
    // For now, we'll need to get this from the image or store it in metadata
    const boxes: ImageACompleterBox[] = regions.map(region => ({
      label: region.label,
      bbox: {
        x1: region.bbox[0],
        y1: region.bbox[1],
        x2: region.bbox[2],
        y2: region.bbox[3]
      }
    }));

    return NextResponse.json(boxes);
  } catch (error) {
    console.error("Error generating image regions:", error);
    return NextResponse.json(
      { error: "An error occurred while generating image regions" },
      { status: 500 }
    );
  }
}
