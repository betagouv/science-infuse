import os
import asyncio
import sys
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from document_processor import process_pdf
import multiprocessing

class WatchdogHandler(FileSystemEventHandler):
    def __init__(self, path_to_watch: str):
        super().__init__()
        self.path_to_watch = path_to_watch
        self.loop = asyncio.get_event_loop()
        self.processing_files = set()

    async def process_media(self, file_path):
        _, extension = os.path.splitext(file_path)
        extension = extension.lower()
        
        if extension == '.pdf':
            print("PROCESSING PDF")
            file_size = os.path.getsize(file_path)
            print(f"File size: {file_size} bytes")
            return await process_pdf(file_path)  # Assuming process_pdf is async
        elif extension == '.mp4':
            return 'MP4 Video'
        elif extension in ['.jpg', '.jpeg', '.png', '.gif']:
            return 'Image'
        elif extension in ['.doc', '.docx']:
            return 'Word Document'
        elif extension == '.txt':
            return 'Text File'
        else:
            return f'Unknown'

    def on_created(self, event):
        if not event.is_directory:
            print(f'File created: {event.src_path}')
            if event.src_path not in self.processing_files:
                self.processing_files.add(event.src_path)
                asyncio.run_coroutine_threadsafe(self.wait_for_file_completion(event.src_path), self.loop)

    async def wait_for_file_completion(self, file_path, timeout=60, check_interval=1):
        start_time = time.time()
        last_size = -1
        
        while time.time() - start_time < timeout:
            try:
                current_size = os.path.getsize(file_path)
                if current_size == last_size and current_size > 0:
                    print(f"File upload complete: {file_path}")
                    await self.process_media(file_path)
                    self.processing_files.remove(file_path)
                    return
                last_size = current_size
            except OSError:
                # File might be locked or inaccessible
                pass
            await asyncio.sleep(check_interval)
        
        print(f"Timeout reached for file: {file_path}")
        self.processing_files.remove(file_path)

def run_file_watcher(path_to_watch):
    sys.stdout = sys.__stdout__  # Redirect stdout to the parent's stdout
    sys.stderr = sys.__stderr__  # Redirect stderr to the parent's stderr
    event_handler = WatchdogHandler(path_to_watch)
    observer = Observer()
    observer.schedule(event_handler, path_to_watch, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()