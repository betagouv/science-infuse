import weaviate
import os
from weaviate import WeaviateClient
class SIWeaviateClient:
    def __init__(self):
        self.client:WeaviateClient = None

    def connect_to_local(self) -> WeaviateClient:
        return weaviate.connect_to_local()

    def connect_with_env(self) -> WeaviateClient:
        return weaviate.connect_to_custom(
            http_host=os.getenv("WEAVIATE_URL"),
            http_port=os.getenv("WEAVIATE_PORT"),
            http_secure=False,
        )

    # TODO: implement different connection strategies for prod/...
    # def connect_to_remote(self):
        # return weaviate.connect_to_remote()

    def __enter__(self) -> WeaviateClient:
        # Change the connection function here
        # self.client = self.connect_to_local()
        self.client = self.connect_with_env()
        return self.client

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            self.client.close()
        return False
