import asyncio
import multiprocessing
import os
import time

from ftp_file_watcher import main

path_to_watch = os.path.join(os.getcwd(), 'ftp-data')
print(f"Watching directory: {path_to_watch}", flush=True)
    
asyncio.run(main(path_to_watch))