import next from 'next';
import api from './apiClient';

// Auth
export async function login(email: string, password: string) {
  const res = await api.post('/user/login', { email, password });
  return res.data;
}

export async function register(email: string, password: string) {
  const res = await api.post('/user/register', { email, password });
  return res.data;
}

// Profile
export async function getProfile() {
  const res = await api.get('/user/getprofile');
  return res.data;
}

// Teams
export async function joinTeam(team_id: string, team_password: string) {
  const res = await api.post('/teams/join', { team_id: team_id, team_password: team_password });
  return res.data;
}

export async function createTeam(name: string, max_size: number, team_password: string) {
  const res = await api.post('/teams/create', { name, max_size, team_password });
  return res.data;
}

export async function getTeams() {
  const res = await api.get('/teams/getteams');  
  return res.data;
}

// Bots
export async function submitBot(formData: FormData) {
  const res = await api.post('/bot/submit', formData);
  return res.data;
}

export async function pollBot(submissionId: string) {
  const res = await api.get(`/submission/${submissionId}/status`);
  return res.data;
}

export async function getSubmissions() {
  const res = await api.get(`/teams/submissions`);
  return res.data;
}

export async function getSubmission(submission_id: string) {
  const res = await api.get(`/submissions/${submission_id}`);
  return res.data;
}


export async function getLeaderboard() {
  const res = await api.get(`/leaderboard`);
  return res.data;
}


export async function getLogs(submission_id: string) {
  const res = await api.get(`/submission/${submission_id}/logs`);
  return res.data;
}

export async function userlogout(){
  const res = await api.post("/user/logout");
  return res.data;
}

export async function getGameLog(log_id: string){
  const res = await api.get(`/logs/${log_id}`);
  return res.data;
}

export async function getR2(){
  const res = await api.get(`/r2`);
  return res.data;
}

export async function getR2Matches(){
  const res = await api.get(`/r2/matches`);
  return res.data;
}

export async function getMatchReplay(match_id: string){
  const res = await api.get(`/r2/matches/${match_id}/logs`);
  console.log(res.data);
  return res.data;
}

export async function verifyEmail(token: string){
  const res = await api.post(`/verify-email`, { token: token });
  return res.data;
}