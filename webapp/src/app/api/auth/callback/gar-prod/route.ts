import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signIn } from '@/auth';

interface GarTokenResponse {
  access_token: string;
  id_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GarUserInfo {
  sub?: string;
  id?: string;
  garpersonidentifiant?: string;
  id_id?: string;
  NOM?: string;
  PRE?: string;
  CIV?: string;
  UAI?: string;
  P_MEL?: string;
  typProfil?: string;
  IDO?: string;
  DIV?: string[];
  GRO?: string[];
  P_MAT?: string;
  sessionIndex?: string;
  auth_time?: number;
  service?: string;
  client_id?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log('[GAR-PROD-CALLBACK] Processing GAR PFPROD callback');

  if (error) {
    console.error(`[GAR-PROD-CALLBACK] OAuth error: ${error}`);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
  }

  if (!code || !state) {
    console.error('[GAR-PROD-CALLBACK] Missing code or state parameter');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
  }

  if (
    !process.env.GAR_PFPROD_CLIENT_ID ||
    !process.env.GAR_PFPROD_CLIENT_SECRET ||
    !process.env.GAR_PFPROD_ISSUER ||
    !process.env.GAR_PFPROD_ID_RESSOURCE
  ) {
    console.error('[GAR-PROD-CALLBACK] Missing PFPROD GAR configuration');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=GarConfig`);
  }

  try {
    const cookieStore = cookies();
    const storedState = cookieStore.get('gar_state')?.value;
    const codeVerifier = cookieStore.get('gar_code_verifier')?.value;
    const callbackUrl = cookieStore.get('gar_callback_url')?.value || '/';

    // Verify state parameter
    if (state !== storedState) {
      console.error('[GAR-PROD-CALLBACK] State mismatch');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    if (!codeVerifier) {
      console.error('[GAR-PROD-CALLBACK] Missing code verifier');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    // Exchange code for tokens
    console.log('[GAR-PROD-CALLBACK] Exchanging code for tokens');
    const tokenResponse = await fetch(`${process.env.GAR_PFPROD_ISSUER}/oidcAccessToken`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.GAR_PFPROD_CLIENT_ID}:${process.env.GAR_PFPROD_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/gar-prod`,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[GAR-PROD-CALLBACK] Token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    const tokens: GarTokenResponse = await tokenResponse.json();
    console.log('[GAR-PROD-CALLBACK] Tokens received successfully');

    // Get user info
    const userInfoUrl = new URL(`${process.env.GAR_PFPROD_ISSUER}/oidcProfile`);
    userInfoUrl.searchParams.set('idRessource', process.env.GAR_PFPROD_ID_RESSOURCE);
    userInfoUrl.searchParams.set('access_mode', 'web');

    const userInfoResponse = await fetch(userInfoUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('[GAR-PROD-CALLBACK] UserInfo request failed:', userInfoResponse.status, errorText);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    const userInfo: GarUserInfo = await userInfoResponse.json();
    console.log('[GAR-PROD-CALLBACK] User info received:', userInfo);

    // Generate a unique sessionIndex for this session
    let sessionIndex: string;

    try {
      const idTokenParts = tokens.id_token.split('.');
      if (idTokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(idTokenParts[1], 'base64').toString());
        console.log('[GAR-PROD-CALLBACK] Decoded ID token payload:', payload);

        sessionIndex = payload.sid ||
          `${userInfo.IDO}_${userInfo.auth_time || Date.now()}`;
      } else {
        sessionIndex = `${userInfo.IDO}_${userInfo.auth_time || Date.now()}`;
      }
    } catch (error) {
      console.warn('[GAR-PROD-CALLBACK] Could not decode ID token, using fallback sessionIndex:', error);
      sessionIndex = `${userInfo.IDO}_${userInfo.auth_time || Date.now()}`;
    }

    userInfo.sessionIndex = sessionIndex;

    console.log('[GAR-PROD-CALLBACK] Generated sessionIndex:', sessionIndex);
    console.log('[GAR-PROD-CALLBACK] Signing user into NextAuth session via \"gar-credentials\" provider...');

    await signIn("gar-credentials", {
      userProfile: JSON.stringify(userInfo),
      redirectTo: callbackUrl,
    });
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    console.error('[GAR-PROD-CALLBACK] Unexpected error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
  }
}

