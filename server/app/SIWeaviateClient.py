import weaviate
import os
from weaviate.connect import ConnectionParams
from weaviate import WeaviateClient
class SIWeaviateClient:
    def __init__(self):
        self.client:WeaviateClient = None

    def connect_to_local(self) -> WeaviateClient:
        return weaviate.connect_to_local()

    def connect_with_env(self) -> WeaviateClient:
        
        client = weaviate.WeaviateClient(
            connection_params=ConnectionParams.from_params(
                http_host=os.getenv("WEAVIATE_URL"),
                http_port=int(os.getenv("WEAVIATE_PORT")),
                http_secure=False,
                grpc_host=os.getenv("WEAVIATE_URL"),
                grpc_port=int(os.getenv("WEAVIATE_GRPC_PORT")),
                grpc_secure=False,
            ),
        )
        return client
        # return weaviate.connect_to_custom(
        #     http_host=os.getenv("WEAVIATE_URL"),
        #     http_port=int(os.getenv("WEAVIATE_PORT")),
        #     http_secure=False,
        #     grpc_host=os.getenv("WEAVIATE_URL"),
        #     grpc_port=int(os.getenv("WEAVIATE_GRPC_PORT")),
        #     grpc_secure=False,
        # )


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
