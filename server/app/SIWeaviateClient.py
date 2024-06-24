import weaviate
from weaviate import WeaviateClient
class SIWeaviateClient:
    def __init__(self):
        self.client:WeaviateClient = None

    def connect_to_local(self) -> WeaviateClient:
        return weaviate.connect_to_local()

    # TODO: implement different connection strategies for prod/...
    # def connect_to_remote(self):
        # return weaviate.connect_to_remote()

    def __enter__(self) -> WeaviateClient:
        # Change the connection function here
        self.client = self.connect_to_local()
        return self.client

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            self.client.close()
        return False
