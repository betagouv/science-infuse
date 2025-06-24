import { NextResponse } from 'next/server';
import { getGarSession } from '@/lib/gar-auth';

export async function GET() {
  try {
    const session = getGarSession();
    
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    return NextResponse.json({
      user: session.user,
      expires: new Date(session.timestamp + (session.tokens.expires_in * 1000)).toISOString(),
    });
  } catch (error) {
    console.error('Error getting GAR session:', error);
    return NextResponse.json({ error: 'Session error' }, { status: 500 });
  }
}