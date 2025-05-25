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
(There has been so UI improvements after recording the walthrough, therefore elements may look a bit different in styling from current website)
## Tech Stack

- **Frontend:** Next.js (React)
- **Backend:** FastAPI + Celery + PostgreSQL + Docker(for running bot scripts)
- **Queue:** Redis
- **Websockets:** Real-time updates for match scores

## Docs

- [Setup Instructions](./SETUP.md)
- [API Reference](./API_DOCS.md)

## Folder Structure

### Backend
```
ProgbattleBackend/
├── seed_data.py
├── main.py
├── bots/
├── ├── bot1.py
├── ├── bot2.py
├── ├── bot3.py
├── ├── bot4.py
├── loadSysBots.py
├── database.py
├── Dockerfile
├── .gitignore
├── r2_fns.py
├── sendmail.py
├── routers/
├── ├── leaderboard.py
├── ├── team.py
├── ├── user.py
├── ├── bot.py
├── ├── __init__.py
├── wsfile.py
├── models.py
├── .env
├── requirements.txt
├── rundb.py
├── dependencies.py
├── r2.py
├── celery_file.py
├── docker/
├── ├── engine/
├── ├── ├── engine.py
├── ├── Dockerfile
├── ├── entrypoint.sh

```


### Frontend

```
ProgBattleFrontend/
├── app/
├── ├── leaderboard/
├── ├── ├── page.tsx
├── ├── api/
├── ├── ├── logout/
├── ├── ├── ├── route.ts
├── ├── globals.css
├── ├── leaderboard2/
├── ├── ├── page.tsx
├── ├── dashboard/
├── ├── ├── page.tsx
├── ├── layout.tsx
├── ├── teams/
├── ├── ├── page.tsx
├── ├── page.tsx
├── ├── favicon.ico
├── ├── (auth)/
├── ├── ├── verify-email/
├── ├── ├── ├── page.tsx
├── ├── ├── login/
├── ├── ├── ├── page.tsx
├── ├── ├── register/
├── ├── ├── ├── page.tsx
├── ├── profile/
├── ├── ├── page.tsx
├── Dockerfile
├── .gitignore
├── Context/
├── ├── UserContext.tsx
├── .env.local
├── components/
├── ├── GameReplay.tsx
├── ├── SubmissionEdit.tsx
├── ├── SubmissionTable.tsx
├── ├── PasswordDialog.tsx
├── ├── DashboardLayout.tsx
├── ├── LeaderboardR2.tsx
├── ├── BotSubmit.tsx
├── ├── LastSubmission.tsx
├── ├── ProfileCard.tsx
├── ├── TeamList.tsx
├── ├── LogsTable.tsx
├── ├── inputfile.tsx
├── ├── sidebar.tsx
├── ├── leaderboard.tsx
├── ├── ui/
├── ├── ├── alert-dialog.tsx
├── ├── ├── dialog.tsx
├── ├── ├── dropdown-menu.tsx
├── ├── ├── label.tsx
├── ├── ├── checkbox.tsx
├── ├── ├── sonner.tsx
├── ├── ├── table.tsx
├── ├── ├── select.tsx
├── ├── ├── input.tsx
├── ├── ├── button.tsx
├── lib/
├── ├── apiClient.ts
├── ├── site.ts
├── ├── utils.ts
├── ├── api.ts
├── ├── logout.ts
├── next.config.ts

```