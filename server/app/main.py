import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from models import create_weaviate_schema
from router import document, search
from starlette.middleware.base import BaseHTTPMiddleware
import logging

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

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# app.add_middleware(BaseHTTPMiddleware, dispatch=catch_exceptions_middleware)


app.include_router(document.router, prefix="/document", tags=["document"])
app.include_router(search.router, prefix="/search", tags=["search"])


@app.on_event("startup")
async def startup_event():
    create_weaviate_schema(remove=False)

@app.get("/")
def read_root():
    return {"message": "Welcome to Science Infuse"}


log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
uvicorn.run(app, log_config=log_config)

