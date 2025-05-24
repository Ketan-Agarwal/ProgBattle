# ProgBattle - Bot Battle Arena

This is a full-stack system for running bot tournaments with live updates, background evaluation, and score tracking.

## Features

- Group and Knockout stage match organization
- 4 different system bots to test against.
- Bot evaluation in isolated docker containers
- Persistent scoring and leaderboard logic
- Email Verification using Gmail's SMTP
- Password based team joining
- RESTful API

## Live Demo

🔗 [Hosted Application](https://progbattle.vercel.app)  
🎥 [Walkthrough Video](https://youtu.be/W0XaopZ6cWU)

## Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** FastAPI + Celery + PostgreSQL + Docker(for running bot scripts)
- **Queue:** Redis
- **Websockets:** Real-time updates for match scores

## Docs

- [Setup Instructions](./SETUP.md)
- [API Reference](./API_DOCS.md)