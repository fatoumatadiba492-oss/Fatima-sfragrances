import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # PostgreSQL en production; SQLite reste le fallback local.
    database_url = os.getenv('DATABASE_URL', 'sqlite:///parfums.db')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = database_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5000,http://localhost:3000,https://frontend-git-main-fd23.vercel.app/,'
    )
    
    # Secret
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')