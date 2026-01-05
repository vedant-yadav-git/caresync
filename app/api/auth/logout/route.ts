import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  await deleteSession();
  
  // Return a redirect response with 303 status (See Other) for POST -> GET redirect
  return NextResponse.redirect(
    new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    { status: 303 }
  );
}
