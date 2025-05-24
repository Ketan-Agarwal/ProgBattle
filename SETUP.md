# Setup Instructions


> These instructions assume you have Python 3.10+, Docker, and Docker Compose installed.


## 1. Clone the repository
```bash
git clone git@github.com:Ketan-Agarwal/ProgBattle.git
cd ProgBattle
```

## 2. Create .env files for backend and frontend

### Backend
```
cp backend.env ProgbattleBackend/.env
```
Modify variables after that.


### Frontend
```
cp frontend.env ProgBattleFrontend/.env
```
Modify required variables

## 3. Create a venv for celery

> Didn't used celery in docker cause celery will itself run docker containers to run `engine.py`.
```bash
cd ./ProgbattleBackend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Now we can run worker like

```bash
celery -A celery_file worker --loglevel=info
```

Leave this terminal running.



## 4. Spin up docker containers

```bash
docker compose up --build
```

This starts 
- FastAPI backend (localhost:8000)
- PostgreSQL DB
- Redis (for task queue)

## 5. Start Frontend

```bash
cd ./ProgBattleFrontend
npm run dev
```
