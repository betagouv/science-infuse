import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from queue import Queue
from threading import Thread
from transformers import pipeline
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator
from processing.text.SISurya import SISurya

from document_processor import process_pdf

# Initialize the queue
file_queue = Queue()

class SingletonMeta(type):
    _instances = {}
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]

class ImageDescriptor(SIImageDescription, metaclass=SingletonMeta):
    pass

class Translator(SITranslator, metaclass=SingletonMeta):
    pass

class Surya(SISurya, metaclass=SingletonMeta):
    pass

class FileHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            self.wait_for_file_completion(event.src_path)
            
    def wait_for_file_completion(self, file_path):
        last_size = -1
        while True:
            try:
                current_size = os.path.getsize(file_path)
                if current_size == last_size:
                    # File size hasn't changed, assume it's complete
                    file_queue.put(file_path)
                    print(f"File {file_path} added to queue")
                    break
                last_size = current_size
            except OSError:
                # File might be in use, wait and retry
                pass
            time.sleep(3)

def process_media(file_path):
    _, extension = os.path.splitext(file_path)
    extension = extension.lower()
    print("PROCESS MEDIA", file_path, flush=True)
    
    if extension == '.pdf':
        print("PROCESSING PDF", flush=True)
        file_size = os.path.getsize(file_path)
        print(f"File size: {file_size} bytes", flush=True)
        image_descriptor = ImageDescriptor()
        translator = Translator()
        surya = Surya()
        try:
            pdf = process_pdf(file_path, image_descriptor, translator, surya)  # Assuming process_pdf is async
        except Exception as e:
            print("ERRROR PROCESSING PDF", e, flush=True)
        return pdf 
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

def process_queue():
    while True:
        file_path = file_queue.get()
        print(f"Processing file: {file_path}", flush=True)
        
        # Use the Hugging Face pipeline to process the file
        result = process_media(file_path)
        print(f"Result for {file_path}: {result}", flush=True)
        
        file_queue.task_done()

def main(path_to_watch: str):
    # Set up the file system observer
    path = path_to_watch  # Replace with the directory you want to watch
    event_handler = FileHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()

    # Start the queue processing thread
    queue_thread = Thread(target=process_queue, daemon=True)
    queue_thread.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
