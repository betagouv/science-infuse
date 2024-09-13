import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
    try {
        const databaseUrl = process.env.DATABASE_URL;
        const containerName = process.env.POSTGRES_CONTAINER_NAME || "postgresql";

        if (!databaseUrl || !containerName) {
            throw new Error('DATABASE_URL or POSTGRES_CONTAINER_NAME is not defined in environment variables');
        }

        // Get the filename from the query parameter
        const searchParams = request.nextUrl.searchParams;
        const fileName = searchParams.get('fileName');

        if (!fileName) {
            return NextResponse.json({ error: 'Filename not provided' }, { status: 400 });
        }

        const backupPath = path.join(process.cwd(), 'backups', fileName);

        // Check if the file exists
        if (!fs.existsSync(backupPath)) {
            return NextResponse.json({ error: 'Backup file not found' }, { status: 404 });
        }

        // Extract database connection details from DATABASE_URL
        const url = new URL(databaseUrl);
        const dbName = url.pathname.substring(1);
        const username = url.username;

        // Copy the backup file into the container
        await execAsync(`docker compose cp ${backupPath} ${containerName}:/tmp/${fileName}`);

        // Construct the Docker exec command to run pg_restore inside the container
        const command = `docker compose exec ${containerName} pg_restore -U ${username} -d ${dbName} -c --if-exists --no-owner --no-privileges /tmp/${fileName}`;

        // Execute the command
        console.log("RUNNING RESTORE SCRIPT START")
        const { stdout, stderr } = await execAsync(command);
        console.log("RUNNING RESTORE SCRIPT END")
        
        if (stderr) {
            console.warn('pg_restore warning:', stderr);
        }

        return NextResponse.json({
            message: 'Database restored successfully',
            fileName: fileName,
            details: stdout
        }, { status: 200 });
    } catch (error: unknown) {
        console.error('Restore failed:', error);
        return NextResponse.json({
            error: 'Failed to restore database',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}