import s3Storage from "@/app/api/S3Storage";
import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const getResizedAndWatermarkedImageBuffer = async (imageBuffer: ArrayBuffer) => {
    // Step 1: Resize the base image first
    const baseImage = sharp(Buffer.from(imageBuffer));
    const { width: originalWidth, height: originalHeight } = await baseImage.metadata();

    if (!originalWidth || !originalHeight) {
        throw new Error('Unable to retrieve base image dimensions.');
    }

    const resizedImageWidth = 400; // Fixed width for resizing
    const resizedImageHeight = Math.round(
        (resizedImageWidth / originalWidth) * originalHeight
    );

    const resizedImageBuffer = await baseImage
        .resize(resizedImageWidth, resizedImageHeight, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toBuffer(); // Snapshot resized state

    // Step 2: Generate watermark SVG dynamically
    const maxWatermarkWidth = Math.round(resizedImageWidth * 0.8); // Round to integer
    const maxWatermarkHeight = Math.round(resizedImageHeight * 0.8); // Round to integer
    const padding = 10;

    const svgWidth = Math.round(maxWatermarkWidth + padding * 2); // Round to integer
    const svgHeight = Math.round(maxWatermarkHeight + padding * 2); // Round to integer

    const watermarkSvg = `
                    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
                        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                              font-family="Arial" font-size="24" font-weight="bold"
                              fill="rgba(255, 0, 0, 0.5)" transform="rotate(-45, ${svgWidth / 2}, ${svgHeight / 2})">
                            Universcience
                        </text>
                    </svg>`;

    // Step 3: Convert SVG to PNG
    const watermarkBuffer = await sharp(Buffer.from(watermarkSvg))
        .resize({
            width: Math.min(maxWatermarkWidth, resizedImageWidth), // Rounded earlier
            height: Math.min(maxWatermarkHeight, resizedImageHeight), // Rounded earlier
            fit: 'inside',
        })
        .png()
        .toBuffer();

    // Step 4: Composite watermark onto resized image
    const compositedImageBuffer = await sharp(resizedImageBuffer)
        .composite([
            {
                input: watermarkBuffer,
                gravity: 'center', // Ensure watermark is centered
                blend: 'over',
            },
        ])
        .toBuffer(); // Snapshot composited image
    return compositedImageBuffer;

}

export async function GET(
    request: NextRequest,
    { params }: { params: { object_name: string[] } }
) {
    const session = await auth();
    const user = session?.user;

    const object_name = params.object_name.join('/');

    if (!object_name) {
        return new Response('Missing object_name parameter', { status: 400 });
    }

    try {
        const presignedUrl = await s3Storage.getPresignedUrl(object_name);

        if (!user) {
            if (object_name.toLowerCase().endsWith('.png')) {
                if (!presignedUrl) {
                    return NextResponse.json({ error: 'Presigned URL not found' }, { status: 404 });
                }

                const response = await fetch(presignedUrl);
                const imageBuffer = await response.arrayBuffer();
                const finalImageBuffer = await getResizedAndWatermarkedImageBuffer(imageBuffer)            // Step 5: Return final image
                return new Response(finalImageBuffer, {
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'public, max-age=60',
                    },
                });
            }
        }

        if (presignedUrl) return NextResponse.redirect(new URL(presignedUrl));
        else return NextResponse.json({ error: 'Presigned URL not found' }, { status: 404 });
    } catch (error) {
        console.error('Error building image:', error);
        return NextResponse.json({ error: 'Error building image' }, { status: 500 });
    }
}
