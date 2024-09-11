import boto3
from botocore.client import Config
import os

class S3Storage:
    def __init__(self):
        self.S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY", "")
        self.S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY", "")
        self.S3_ENDPOINT = os.environ.get("S3_ENDPOINT", "")
        self.S3_REGION = os.environ.get("S3_REGION", "")
        self.bucket_name = os.environ.get("S3_BUCKET", "")
        self.is_dev = os.environ.get("ENVIRONMENT", "") == "dev"
        
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=self.S3_ACCESS_KEY,
            aws_secret_access_key=self.S3_SECRET_KEY,
            endpoint_url=self.S3_ENDPOINT,
            region_name=self.S3_REGION
        )

    def list_buckets(self):
        response = self.s3_client.list_buckets()
        print("Buckets existants :")
        for bucket in response['Buckets']:
            print(f'  {bucket["Name"]}')

    def list_objects(self):
        response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
        print(f"Objets dans le bucket {self.bucket_name} :")
        for obj in response.get('Contents', []):
            print(f'  {obj["Key"]}')

    def upload_file(self, input_file_path, s3ObjectName):
        try:
            self.s3_client.upload_file(input_file_path, self.bucket_name, s3ObjectName, ExtraArgs={'ACL': 'public-read'})
            print(f"File {input_file_path} uploaded successfully to bucket {self.bucket_name} as {s3ObjectName}.")
            
            # Generate the public URL
            public_url = f"{self.S3_ENDPOINT}/{self.bucket_name}/{s3ObjectName}"
            # print(f"Public URL: {public_url}")
            return public_url
        except Exception as e:
            print(f"Error during file upload: {e}")
            return None

    def get_presigned_url(self, object_name, expiration=3600):
        return self.s3_client.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': self.bucket_name, 'Key': object_name},
            ExpiresIn=expiration  # URL expiration time in seconds
        )
    
    def remove_file(self, object_name):
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_name)
            print(f"File {object_name} successfully removed from bucket {self.bucket_name}.")
            return True
        except Exception as e:
            print(f"Error during file removal: {e}")
            return False
