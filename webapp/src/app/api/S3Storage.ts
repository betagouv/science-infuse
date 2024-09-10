import { S3Client, ListBucketsCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs';

class S3Storage {
    private S3_ACCESS_KEY: string;
    private S3_SECRET_KEY: string;
    private S3_ENDPOINT: string;
    private S3_REGION: string;
    private bucket_name: string;
    private is_dev: boolean;
    private s3_client: S3Client;

    constructor() {
        this.S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || process.env.NEXT_PUBLIC_S3_ACCESS_KEY || "";
        this.S3_SECRET_KEY = process.env.S3_SECRET_KEY || process.env.NEXT_PUBLIC_S3_SECRET_KEY || "";
        this.S3_ENDPOINT = process.env.S3_ENDPOINT || process.env.NEXT_PUBLIC_S3_ENDPOINT || "";
        this.S3_REGION = process.env.S3_REGION || process.env.NEXT_PUBLIC_S3_REGION || "";
        this.bucket_name = process.env.S3_BUCKET || process.env.NEXT_PUBLIC_S3_BUCKET || "";
        this.is_dev = (process.env.ENVIRONMENT || process.env.NEXT_PUBLIC_ENVIRONMENT) === "dev";

        this.s3_client = new S3Client({
            credentials: {
                accessKeyId: this.S3_ACCESS_KEY,
                secretAccessKey: this.S3_SECRET_KEY,
            },
            endpoint: this.S3_ENDPOINT,
            region: this.S3_REGION,
        });
    }

    async listBuckets(): Promise<void> {
        try {
            const command = new ListBucketsCommand({});
            const response = await this.s3_client.send(command);
            console.log("Existing buckets:");
            response.Buckets?.forEach(bucket => {
                console.log(`  ${bucket.Name}`);
            });
        } catch (error) {
            console.error("Error listing buckets:", error);
        }
    }

    async listObjects(): Promise<void> {
        try {
            const command = new ListObjectsV2Command({ Bucket: this.bucket_name });
            const response = await this.s3_client.send(command);
            console.log(`Objects in bucket ${this.bucket_name}:`);
            response.Contents?.forEach(obj => {
                console.log(`  ${obj.Key}`);
            });
        } catch (error) {
            console.error("Error listing objects:", error);
        }
    }

    async uploadFile(inputFilePath: string, s3ObjectName: string): Promise<string | null> {
        try {
            const fileContent = await fs.promises.readFile(inputFilePath);
            const command = new PutObjectCommand({
                Bucket: this.bucket_name,
                Key: s3ObjectName,
                Body: fileContent,
                ACL: 'public-read'
            });
            await this.s3_client.send(command);
            console.log(`File ${inputFilePath} uploaded successfully to bucket ${this.bucket_name} as ${s3ObjectName}.`);
            
            const publicUrl = `${this.S3_ENDPOINT}/${this.bucket_name}/${s3ObjectName}`;
            return publicUrl;
        } catch (error) {
            console.error("Error during file upload:", error);
            return null;
        }
    }

    async getPresignedUrl(objectName: string, expiration: number = 3600): Promise<string | null> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket_name,
                Key: objectName,
            });
            return await getSignedUrl(this.s3_client, command, { expiresIn: expiration });
        } catch (error) {
            console.error("Error generating presigned URL:", error);
            return null;
        }
    }

    async removeFile(objectName: string): Promise<boolean> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket_name,
                Key: objectName,
            });
            await this.s3_client.send(command);
            console.log(`File ${objectName} successfully removed from bucket ${this.bucket_name}.`);
            return true;
        } catch (error) {
            console.error("Error during file removal:", error);
            return false;
        }
    }
}
export default new S3Storage()
