import logging
from watchdog.observers import Observer
from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from models import create_weaviate_schema
from router import document, search
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
app.include_router(document.router, prefix="/document", tags=["document"])
app.include_router(search.router, prefix="/search", tags=["search"])


@app.on_event("startup")
async def startup_event():
    create_weaviate_schema(remove=True)
    # watch for new files in the 
    # path_to_watch = os.path.join(os.getcwd(), '..', 'ftp-data')

    # print("path_to_watch", path_to_watch)
    # print("LIST DIR", os.listdir(os.getcwd()))
    #    # Start the file watcher in a separate process
    # watcher_process = multiprocessing.Process(target=run_file_watcher, args=(path_to_watch,))
    # watcher_process.start()

    # event_handler = WatchdogHandler(path_to_watch)
    # observer = Observer()
    # observer.schedule(event_handler, path_to_watch, recursive=True)
    # observer.start()

    # # Run observer in a separate thread
    # def run_observer():
    #     observer.join()
    # import threading
    # observer_thread = threading.Thread(target=run_observer)
    # observer_thread.start()


@app.get("/")
def read_root():
    return {"message": "Welcome to Science Infuse"}


log_config = uvicorn.config.LOGGING_CONFIG
log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"

import os

print("WEAVIATE_URL", os.getenv("WEAVIATE_URL"))
print("WEAVIATE_PORT", os.getenv("WEAVIATE_PORT"))
print("WEAVIATE_URL", os.getenv("WEAVIATE_URL"))
print("WEAVIATE_GRPC_PORT", os.getenv("WEAVIATE_GRPC_PORT"))
        
uvicorn.run(app, host="0.0.0.0", log_config=log_config)

