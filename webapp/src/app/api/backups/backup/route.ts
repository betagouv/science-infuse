import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        const containerName = process.env.POSTGRES_CONTAINER_NAME || "postgresql";
        const projectName = process.env.COMPOSE_PROJECT_NAME || path.basename(process.cwd());

        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `backup-${timestamp}.dump`;
        const backupPath = path.join(process.cwd(), 'backups', backupFileName);

        // Ensure the backups directory exists
        await fs.promises.mkdir(path.join(process.cwd(), 'backups'), { recursive: true });

        // Extract database connection details from DATABASE_URL
        const url = new URL(databaseUrl);
        const dbName = url.pathname.substring(1);
        const username = url.username;

        // Get the actual container name
        const { stdout: containerIdOutput } = await execAsync(`docker compose ps -q ${containerName}`);
        const containerId = containerIdOutput.trim();

        if (!containerId) {
            throw new Error(`Container ${containerName} not found. Make sure it's running.`);
        }

        // Construct the Docker exec command to run pg_dump inside the container
        const dumpCommand = `docker exec ${containerId} pg_dump -U ${username} -d ${dbName} -Fc -f /tmp/${backupFileName}`;
        const copyCommand = `docker cp ${containerId}:/tmp/${backupFileName} ${backupPath}`;

        // Execute the commands
        console.log("Running backup command:", dumpCommand);
        const { stdout: dumpOutput, stderr: dumpError } = await execAsync(dumpCommand);
        console.log("Dump output:", dumpOutput);
        if (dumpError) console.warn('pg_dump warning:', dumpError);

        console.log("Running copy command:", copyCommand);
        const { stdout: copyOutput, stderr: copyError } = await execAsync(copyCommand);
        console.log("Copy output:", copyOutput);
        if (copyError) console.warn('docker cp warning:', copyError);

        return NextResponse.json({
            message: 'Backup created successfully',
            fileName: backupFileName,
            details: dumpOutput + '\n' + copyOutput
        }, { status: 200 });
    } catch (error: unknown) {
        console.error('Backup failed:', error);
        return NextResponse.json({
            error: 'Failed to create backup',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}