import logging
from watchdog.observers import Observer
from fastapi import BackgroundTasks, Depends, FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
import uvicorn
from S3Storage import S3Storage
from SIWeaviateClient import SIWeaviateClient
from models import create_weaviate_schema
from router import document, search, user_approved, rerank, embedding
import logging
from redis import asyncio as aioredis
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache
from fastapi_cache.backends.inmemory import InMemoryBackend
from fastapi_cache.backends.redis import RedisBackend

s3 = S3Storage()
# create an instance of the logger
logger = logging.getLogger()
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        logger.error(f"{request.url}\t{request.query_params}")
        return await call_next(request)
    except Exception as e:
        logging.critical(e, exc_info=True)
        return JSONResponse(
            status_code=500,
            content=None
        )

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
@app.middleware("http")
async def add_cors_headers(request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.options("/{rest_of_path:path}")
async def options_route(request: Request):
    return JSONResponse(
        status_code=200,
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

app.include_router(embedding.router, prefix="/embedding", tags=["embedding"])
app.include_router(rerank.router, prefix="/rerank", tags=["rerank"])
app.include_router(document.router, prefix="/document", tags=["document"])
app.include_router(search.router, prefix="/search", tags=["search"])
app.include_router(user_approved.router, prefix="/approve", tags=["approve"])


@app.on_event("startup")
async def startup_event():
    create_weaviate_schema(remove=False)
    redis = aioredis.from_url("redis://localhost", encoding="utf8", decode_responses=True)
    # redis = aioredis.from_url(os.environ.get("REDIS_URL", "redis://redis:6379"))
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")


@app.get("/")
def read_root():
    return {"message": "Welcome to Science Infuse"}



@cache(expire=3600)
async def get_s3_url(s3_object_name: str):
    print(f"Attempting to retrieve cache for {s3_object_name}")
    s3_public_path = s3.get_presigned_url(s3_object_name, expiration=3600)
    print(f"Generated URL: {s3_public_path}")
    return s3_public_path

@cache(expire=3600)
async def get_s3_url_from_uuid(document_uuid: str):
    print(f"Attempting to retrieve cache for {document_uuid}")
    with SIWeaviateClient() as client:
        s3_object_name = client.collections.get("Document").query.fetch_object_by_id(document_uuid).properties.get('s3_object_name')
        print(f"Getting signed url for : {s3_object_name}")
        s3_public_path = s3.get_presigned_url(s3_object_name, expiration=3600)
        print(f"Generated URL: {s3_public_path}")
        return s3_public_path

@app.get("/s3/{s3_object_name:path}")
async def s3_redirect(s3_object_name: str, s3_url: str = Depends(get_s3_url)):
    print(f"Redirecting to: {s3_url}")
    response = RedirectResponse(s3_url, status_code=307)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.get("/s3_url_pdf/{document_uuid:path}")
async def get_s3_url(document_uuid: str, s3_url: str = Depends(get_s3_url_from_uuid)):
    return s3_url



log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"

        
uvicorn.run(app, host="0.0.0.0", log_config=log_config)

