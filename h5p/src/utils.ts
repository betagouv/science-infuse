import express from 'express';
import os from 'os';
import { Request } from 'express';
import { rm } from 'fs/promises';
import { IRequestWithUser } from '@lumieducation/h5p-express';
import ExampleUser from './ExampleUser';

/**
 * Displays links to the server at all available IP addresses.
 * @param port The port at which the server can be accessed.
 */
export function displayIps(port: string): void {
    console.log('Example H5P NodeJs server is running:');
    const networkInterfaces = os.networkInterfaces();
    // eslint-disable-next-line guard-for-in
    for (const devName in networkInterfaces) {
        networkInterfaces[devName]
            .filter((int) => !int.internal)
            .forEach((int) =>
                console.log(
                    `http://${int.family === 'IPv6' ? '[' : ''}${int.address}${
                        int.family === 'IPv6' ? ']' : ''
                    }:${port}`
                )
            );
    }
}

/**
 * This method will delete all temporary uploaded files from the request
 */
export async function clearTempFiles(
    req: Request & { files: any }
): Promise<void> {
    if (!req.files) {
        return;
    }

    await Promise.all(
        Object.keys(req.files).map((file) =>
            req.files[file].tempFilePath !== undefined &&
            req.files[file].tempFilePath !== ''
                ? rm(req.files[file].tempFilePath, {
                      recursive: true,
                      force: true
                  })
                : Promise.resolve()
        )
    );
}


export const checkAdaH5pSecret = (req: express.Request, res: any): boolean => {
    const ADA_H5P_SECRET = process.env.ADA_H5P_SECRET;
    const requestSecret = req.body.ada_h5p_secret;

    // console.log("CHECKING ada_h5p_secret", requestSecret, ADA_H5P_SECRET)

    if (!requestSecret || requestSecret !== ADA_H5P_SECRET) {
        // res.status(403).send('Forbidden').end();
        return false;
    }
    req.user = new ExampleUser('admin', 'admin', 'admin', "admin");
    return true;
}

