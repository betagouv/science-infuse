// lib/gar-auth.ts - GAR authentication utilities
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface GarUser {
  sub?: string;
  id?: string;
  IDO?: string;
  NOM?: string;
  PRE?: string;
  CIV?: string;
  UAI?: string;
  P_MEL?: string;
  typProfil?: string;
  DIV?: string[];
  GRO?: string[];
  P_MAT?: string;
}

export interface GarSession {
  user: GarUser;
  tokens: {
    access_token: string;
    id_token: string;
    refresh_token?: string;
    token_type: string;
    expires_in: number;
  };
  timestamp: number;
}

export function getGarSession(): GarSession | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('gar_user_session');
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    const sessionData: GarSession = JSON.parse(sessionCookie.value);
    
    // Check if session is still valid
    const now = Date.now();
    const sessionAge = now - sessionData.timestamp;
    const maxAge = (sessionData.tokens.expires_in || 21600) * 1000; // Convert to ms
    
    if (sessionAge > maxAge) {
      return null; // Session expired
    }
    
    return sessionData;
  } catch (error) {
    console.error('Error parsing GAR session:', error);
    return null;
  }
}

export function requireGarAuth(): GarSession {
  const session = getGarSession();
  
  if (!session) {
    redirect('/connexion?error=AuthRequired');
  }
  
  return session;
}
