# Heberger le backend avec SQLite sur PythonAnywhere

Le frontend reste sur Netlify. Le backend Flask et la base SQLite sont heberges sur PythonAnywhere.

## 1. Importer le projet

Dans une console Bash PythonAnywhere :

```bash
git clone https://github.com/fatoumatadiba492-oss/Fatima-sfragrances.git
cd Fatima-sfragrances/backend
python3 -m venv venv
source venv/bin/activate
pip install -r server/requirements.txt
```

## 2. Creer le site Web

Dans l'onglet **Web** :

- Add a new web app
- Manual configuration
- Choisir Python 3
- Virtualenv : `/home/fdiba23/Fatima-sfragrances/backend/venv`

Dans le fichier WSGI, mettre :

```python
import sys
project_path = '/home/fdiba23/Fatima-sfragrances/backend/server'
if project_path not in sys.path:
    sys.path.insert(0, project_path)
from app import app as application
```

## 3. Variables locales du backend

Dans une console Bash :

```bash
cd ~/Fatima-sfragrances/backend/server
nano .env
```

Mettre :

```env
DATABASE_URL=sqlite:///parfums.db
CORS_ORIGINS=https://fatimafragrances.netlify.app,https://fatimafragrances.vercel.app
SECRET_KEY=une-cle-secrete-longue
```

Le fichier SQLite sera conserve sur PythonAnywhere avec le backend.

## 4. Recharger et tester

Dans **Web**, cliquer sur **Reload**, puis ouvrir :

```text
https://fdiba23.pythonanywhere.com/api/health
```

## 5. Connecter Netlify

Dans Netlify, ajouter la variable d'environnement :

```text
VITE_API_URL=https://fdiba23.pythonanywhere.com
```

Puis lancer un nouveau deploy du frontend.
