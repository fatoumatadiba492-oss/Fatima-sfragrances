# Deploiement Railway

Le projet se deploie comme deux services Railway dans le meme projet : un backend Flask et un frontend Vite.

## 1. Creer PostgreSQL

Dans Railway, creer un service **PostgreSQL**. Railway fournira la variable `DATABASE_URL`.

La meme variable peut venir de Supabase ou Neon. Elle doit commencer par `postgresql://` (ou `postgres://`, qui est converti automatiquement).

## 2. Deployer le backend

Creer un service depuis GitHub et definir le **Root Directory** a `backend/server`.

Variables :

```text
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=une-cle-secrete-longue
CORS_ORIGINS=https://votre-frontend.up.railway.app
```

Le `Procfile` lance Gunicorn automatiquement. Tester ensuite :

```text
https://votre-backend.up.railway.app/api/health
```

## 3. Deployer le frontend

Creer un second service depuis le meme depot et definir le **Root Directory** a `frontend`.

Build command :

```text
npm run build
```

Start command :

```text
npm run start
```

Variable :

```text
VITE_API_URL=https://votre-backend.up.railway.app
```

Apres avoir obtenu le domaine frontend, reporter ce domaine dans `CORS_ORIGINS` du backend.

## 4. Migrer SQLite vers Supabase

Place l'URL PostgreSQL Supabase dans `backend/server/.env` :

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

Depuis `backend/server`, lance :

```powershell
..\venv\Scripts\python.exe migrate_sqlite_to_postgres.py
```

Le script migre les produits, ventes, crédits, réapprovisionnements et paramètres. Il refuse de s'exécuter si `DATABASE_URL` pointe encore vers SQLite.

## 5. Local

Le fonctionnement local reste identique : SQLite est utilisee si `DATABASE_URL` n'est pas definie.

Le schema SQL pret a coller dans Supabase se trouve dans `backend/server/supabase_schema.sql`.
