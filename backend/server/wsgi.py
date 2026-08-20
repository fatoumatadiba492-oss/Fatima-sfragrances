import sys
from pathlib import Path

project_path = Path(__file__).resolve().parent
if str(project_path) not in sys.path:
    sys.path.insert(0, str(project_path))

from app import app as application
