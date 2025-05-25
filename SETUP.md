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
Modify required variables.


### Frontend
```
cp frontend.env ProgBattleFrontend/.env
```
Modify required variables.

## 3. Create a venv for celery

> Didn't used celery in docker because celery will itself run docker containers to run bot battles.
```bash
cd ./ProgbattleBackend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 4. Create Bot Runner Docker Image

```bash
docker build -t bot-runner-1 ./ProgbattleBackend/docker/
```

## 5. Spin up docker containers

```bash
docker compose up --build -d # make sure you are in root of repo where docker-compose.yml file exist.
```
> Make sure service ports are not in use.

This starts 
- FastAPI backend (localhost:8000)
- PostgreSQL DB
- Redis (for task queue)

Now we can run worker like

```bash
celery -A celery_file worker --loglevel=info
```

Leave this terminal running.


## 5. Start Frontend

```bash
cd ./ProgBattleFrontend
npm install
npm run dev
```
