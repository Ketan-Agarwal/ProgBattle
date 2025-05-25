# Project ProgBattle API Client Documentation


This document explains all the API helper functions used to communicate with the ProgBattle backend from the Next.js frontend.



#### Base URL: `http://localhost:8000`
#### Base URL for `https://progbattle.vercel.app` is `https://progbattle.vercel.app/apiv1` or `https://progback.zapto.org`


## First use `/user/login` to login account and then use authenticated routes.

## Round 2 (R2)

### Start Round 2

Start Round 2 of the tournament. Only accessible by admin users.

- Method: POST
- Endpoint: `/start-round-2`
- Authorization: Admin-only

admin creds: 

email: `admin@admin.com`

password: `admin124`


Response:
```json
{
    "message": "Round 2 has been started."
}
```

Errors:
- `403 Forbidden`: If the user is not an admin.
- `400 Bad Request`: If Round 2 has already started.


## Authentication

For authentication, the application is using token-based cookies with JWT token stored as `access_token` in cookies.

`login(email: string, password: string)`

### Login
Logs in a user with email and password.
- Method: POST
- Endpoint: `/user/login`
- Request Body:

```json
{
  "email": "string",
  "password": "string"
}
```
Returns: Message.

### Register

`register(email: string, password: string)
`

Registers a new user with email and password.

- Method: POST
- Endpoint: `/user/register`
- Request Body:

```json
{
  "email": "string",
  "password": "string"
}
```
Returns: Confirmation message.


### Logout

Logs out the current user.
- Method: POST
- Endpoint: /user/logout

Returns: Confirmation of logout.

## User Profile

Get current users profile details.
- Method: GET
- Endpoint: `/user/getprofile`

Response: User Profile JSON object including id, team_id, email, team_name, is_verified

## Teams

### Join Team

- Method: POST
- Endpoint: `/teams/join`
- Request body:
```json
{
  "team_id": "string",
  "team_password": "string"
}
```

### Create Team
- Method: POST
- Endpoint: `/teams/create`
- Request Body: 
```json
{
  "name": "string",
  "max_size": "number",
  "team_password": "string"
}
```

### Get Teams
- Method: GET
- Endpoint: `/teams/getteams`

Returns: Array of teams



## Bots and Submissions

### Submitting a bot

- Method: POST
- Endpoint: `/bot/submit`
- Content-Type: `multipart/form-data`
- Request Body: 
    file: File, bot_name: string

Response: 
```json
{
  "message": "Bot submitted successfully.",
  "submission_id": "uuid-string"
}
```

### Get submissions

Get all the submissions by the user's team.

- Method: GET
- Endpoint: `/teams/submissions`

Returns: Array of submission objects.

### Get submission details

Get detailed info on a specific submission.

- Method: GET
- Endpoint: `/submissions/{submission_id}`

Returns: Submission details and results.

---

## Leaderboard

### Get leaderboard

Fetch the current leaderboard rankings.

- Method: GET
- Endpoint: `/leaderboard`

Returns: Ranked list of teams or players.

---

## Logs & Game Data

### Get logs for a submission

Fetch logs for a specific submission.

- Method: GET
- Endpoint: `/submission/{submission_id}/logs`

Returns: Log text or structured log data.

### Get game log

Fetch detailed game logs by ID.

- Method: GET
- Endpoint: `/logs/{log_id}`

Returns: Detailed game replay logs.

---

## Round 2 (R2)

### Get R2 metadata

Fetch data related to Round 2 (R2) of the tournament.

- Method: GET
- Endpoint: `/r2`

Returns: R2 status.

### Get R2 matches

Get all matches in Round 2.

- Method: GET
- Endpoint: `/r2/matches`

Returns: Array of match objects.

### Get match replay

Get replay logs for a specific match.

- Method: GET
- Endpoint: `/r2/matches/{match_id}/logs`

Returns: Replay logs data.

---

## Miscellaneous

### Verify email

Verify user email via token sent in email.

- Method: POST
- Endpoint: `/verify-email`
- Request Body:
```json
{
  "token": "string"
}
```

Returns: Verification success or failure message.
