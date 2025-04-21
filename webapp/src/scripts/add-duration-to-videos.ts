import { PrismaClient, Document } from '@prisma/client';
import cliProgress from 'cli-progress';
import axios from 'axios';
import S3Storage from '../app/api/S3Storage'; 
import { exec as execCallback } from 'child_process'; 
import fs from 'fs/promises'; 
import path from 'path'; 
import os from 'os'; 
import util from 'util'; 

const exec = util.promisify(execCallback); 

const prisma = new PrismaClient();

/**
 * Calculates the duration of a video stored in S3 using ffprobe.
 * @param s3ObjectName The key of the video object in the S3 bucket.
 * @returns The duration of the video in seconds, or null if calculation fails.
 */
async function calculateVideoDuration(s3ObjectName: string): Promise<number | null> {
    let tempFilePath: string | null = null;
    try {
        console.log(`\nFetching presigned URL for ${s3ObjectName}...`);
        const presignedUrl = await S3Storage.getPresignedUrl(s3ObjectName, 300); // 5-minute expiry
        if (!presignedUrl) {
            console.error(`Failed to get presigned URL for ${s3ObjectName}`);
            return null;
        }
        console.log(`Got presigned URL. Downloading video...`);

        // Create a temporary file path
        const tempDir = os.tmpdir();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        tempFilePath = path.join(tempDir, `video-${uniqueSuffix}.tmp`);

        // Download the video file using axios
        const response = await axios({
            method: 'get',
            url: presignedUrl,
            responseType: 'stream',
        });

        // Save the video stream to the temporary file
        const writer = require('fs').createWriteStream(tempFilePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        console.log(`Video downloaded to ${tempFilePath}. Running ffprobe...`);

        // Run ffprobe to get the duration
        const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFilePath}"`;
        const { stdout, stderr } = await exec(command);

        if (stderr) {
            console.error(`ffprobe error for ${s3ObjectName}: ${stderr}`);
            return null;
        }

        const duration = parseFloat(stdout.trim());
        if (isNaN(duration)) {
            console.error(`Could not parse duration from ffprobe output for ${s3ObjectName}: ${stdout}`);
            return null;
        }

        console.log(`Calculated duration for ${s3ObjectName}: ${duration} seconds.`);
        return duration;

    } catch (error: any) {
        console.error(`Error x ${s3ObjectName}:`, error.message || error);
        return null;
    } finally {
        // Clean up the temporary file
        if (tempFilePath) {
            try {
                await fs.unlink(tempFilePath);
                console.log(`Deleted temporary file ${tempFilePath}`);
            } catch (cleanupError: any) {
                console.error(`Error deleting temporary file ${tempFilePath}:`, cleanupError.message || cleanupError);
            }
        }
    }
}

/**
 * Processes a single document to calculate and update its duration.
 * @param documentId The ID of the document to process.
 */
const processDocumentDuration = async (documentId: string): Promise<boolean> => {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
    });

    if (!document) {
        console.log(`\nDocument ${documentId} not found.`);
        return false;
    }

    if (document.duration !== null && document.duration !== undefined) {
        console.log(`\nDocument ${documentId} already has duration: ${document.duration}. Skipping.`);
        return true; // Already processed
    }

    if (!document.s3ObjectName) {
        console.log(`\nDocument ${documentId} has no s3ObjectName. Skipping.`);
        return false;
    }

    console.log(`\nProcessing document ${documentId} (${document.mediaName || 'No Name'})...`);
    const duration = await calculateVideoDuration(document.s3ObjectName);

    if (duration !== null) {
        try {
            await prisma.document.update({
                where: { id: documentId },
                data: { duration: duration },
            });
            console.log(`Successfully updated duration for document ${documentId} to ${duration} seconds.`);
            return true;
        } catch (updateError: any) {
            console.error(`Failed to update duration for document ${documentId}:`, updateError.message || updateError);
            return false;
        }
    } else {
        console.error(`Failed to calculate duration for document ${documentId}.`);
        return false;
    }
};

/**
 * Processes a batch of document IDs in parallel.
 * @param documentIds Array of document IDs to process.
 * @param progressBar CLI progress bar instance.
 */
const processBatch = async (documentIds: string[], progressBar: cliProgress.SingleBar) => {
    // Process documents sequentially to avoid overwhelming S3/ffprobe
    for (const id of documentIds) {
        await processDocumentDuration(id);
        progressBar.increment();
    }
    // If parallel processing is desired and manageable:
    // await Promise.all(documentIds.map(async (id) => {
    //     await processDocumentDuration(id);
    //     progressBar.increment();
    // }));
};

/**
 * Fetches documents that need duration processing.
 * @param skip Number of documents to skip.
 * @param batchSize Number of documents to fetch.
 * @returns A batch of documents.
 */
async function getDocumentsNeedingProcessing(skip: number, batchSize: number): Promise<Document[]> {
    // Find documents associated with video transcripts that have null duration
    const batch = await prisma.document.findMany({
        where: {
            duration: null, // Target documents where duration is not set
            documentChunks: {
                some: {
                    mediaType: "video_transcript", // Ensure it's linked to a video transcript chunk
                },
            },
            s3ObjectName: { // Ensure there is an S3 object to process
                not: null
            }
        },
        take: batchSize,
        skip: skip,
    });
    return batch;
}

/**
 * Counts the total number of documents that need duration processing.
 * @returns The total count.
 */
async function getTotalDocumentCount(): Promise<number> {
    return await prisma.document.count({
        where: {
            duration: null,
            documentChunks: {
                some: {
                    mediaType: "video_transcript",
                },
            },
            s3ObjectName: {
                not: null
            }
        },
    });
}

async function main() {
    const QUERY_BATCH_SIZE = 50; // Number of documents to query from DB at once
    const PROCESSING_BATCH_SIZE = 1; // Number of documents to process sequentially (adjust if parallel is safe)

    console.log("Starting script to add duration to videos...");

    const totalDocumentsToProcess = await getTotalDocumentCount();
    if (totalDocumentsToProcess === 0) {
        console.log("No documents found needing duration processing.");
        return;
    }
    console.log(`Total documents needing duration processing: ${totalDocumentsToProcess}`);

    const progressBar = new cliProgress.SingleBar({
        format: 'Processing |' + '{bar}' + '| {percentage}% || {value}/{total} Documents',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    progressBar.start(totalDocumentsToProcess, 0);

    let skip = 0;
    let processedCount = 0;

    while (processedCount < totalDocumentsToProcess) {
        const batch = await getDocumentsNeedingProcessing(skip, QUERY_BATCH_SIZE);
        if (batch.length === 0) {
            // Should not happen if totalDocumentsToProcess > 0 and loop condition is correct,
            // but good as a safeguard.
            console.log("\nNo more documents found in batch, finishing up.");
            break;
        }

        const documentIdsToProcess = batch.map(doc => doc.id);

        // Process the fetched batch
        for (let i = 0; i < documentIdsToProcess.length; i += PROCESSING_BATCH_SIZE) {
            const processingSlice = documentIdsToProcess.slice(i, i + PROCESSING_BATCH_SIZE);
            await processBatch(processingSlice, progressBar);
        }

        // Update processed count based on how many were attempted in this DB batch
        // Note: progressBar increments inside processBatch
        processedCount += batch.length;

        // No need to increment skip, as we are filtering by duration: null.
        // Processed items won't appear in the next query.
        // If we were iterating through *all* items, we'd use: skip += batch.length;
    }

    progressBar.stop();
    console.log(`\nFinished processing. Processed approximately ${processedCount} documents.`);
}

main()
    .catch((e) => {
        console.error("\nAn error occurred:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log("Database connection closed.");
    });
