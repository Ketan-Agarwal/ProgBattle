// /app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  
  return new NextResponse(JSON.stringify({ message: 'Logged out successfully' }), {
    status: 200,
    headers: {
      'Set-Cookie': 'token=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict',
      'Content-Type': 'application/json'
    },
  });
}
