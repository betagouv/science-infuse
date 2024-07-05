import os
from fastapi import FastAPI, BackgroundTasks
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from document_processor import process_pdf


class WatchdogHandler(FileSystemEventHandler):
    def __init__(self, path_to_watch: str):
        super().__init__()
        self.path_to_watch = path_to_watch

    def process_media(self, file_path):
        _, extension = os.path.splitext(file_path)
        extension = extension.lower()
        
        if extension == '.pdf':
            return process_pdf(file_path)
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
            self.process_media(event.src_path)
