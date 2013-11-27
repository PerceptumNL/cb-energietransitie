import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import logging
import shutil

class LoggingEventHandler(FileSystemEventHandler):

    """Logs all the events captured."""

    def on_moved(self, event):
        super(LoggingEventHandler, self).on_moved(event)

        what = 'directory' if event.is_directory else 'file'
        print("Moved %s: from %s to %s", what, event.src_path,
                     event.dest_path)

    def on_created(self, event):
        super(LoggingEventHandler, self).on_created(event)

        what = 'directory' if event.is_directory else 'file'
        print("Created %s: %s", what, event.src_path)

    def on_deleted(self, event):
        super(LoggingEventHandler, self).on_deleted(event)

        what = 'directory' if event.is_directory else 'file'
        print("Deleted %s: %s", what, event.src_path)

    def on_modified(self, event):
        super(LoggingEventHandler, self).on_modified(event)
        shutil.copyfile("bootstrap/dist/css/bootstrap.css", "coursebuilder/assets/css/bootstrap.css")
        shutil.copyfile("bootstrap/dist/js/bootstrap.js", "coursebuilder/assets/lib/bootstrap.js")

        print("Bootstrap updated!")
        what = 'directory' if event.is_directory else 'file'
        print("Modified %s: %s", what, event.src_path)


if __name__ == "__main__":
    event_handler = LoggingEventHandler()
    observer = Observer()
    observer.schedule(event_handler, path='./bootstrap', recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
