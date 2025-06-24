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
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log('[GAR-CALLBACK] Processing GAR callback');

  if (error) {
    console.error(`[GAR-CALLBACK] OAuth error: ${error}`);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
  }

  if (!code || !state) {
    console.error('[GAR-CALLBACK] Missing code or state parameter');
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
  }

  try {
    const cookieStore = cookies();
    const storedState = cookieStore.get('gar_state')?.value;
    const codeVerifier = cookieStore.get('gar_code_verifier')?.value;
    const callbackUrl = cookieStore.get('gar_callback_url')?.value || '/';

    // Verify state parameter
    if (state !== storedState) {
      console.error('[GAR-CALLBACK] State mismatch');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    if (!codeVerifier) {
      console.error('[GAR-CALLBACK] Missing code verifier');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    // Exchange code for tokens
    console.log('[GAR-CALLBACK] Exchanging code for tokens');
    const tokenResponse = await fetch('https://idp-auth.partenaire.test-gar.education.fr/oidc/oidcAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.GAR_CLIENT_ID}:${process.env.GAR_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/gar`,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[GAR-CALLBACK] Token exchange failed:', tokenResponse.status, errorText);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    const tokens: GarTokenResponse = await tokenResponse.json();
    console.log('[GAR-CALLBACK] Tokens received successfully');

    // Get user info
    const userInfoUrl = new URL('https://idp-auth.partenaire.test-gar.education.fr/oidc/oidcProfile');
    userInfoUrl.searchParams.set('idRessource', process.env.GAR_ID_RESSOURCE!);
    userInfoUrl.searchParams.set('access_mode', 'web');

    const userInfoResponse = await fetch(userInfoUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Accept': 'application/json',
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('[GAR-CALLBACK] UserInfo request failed:', userInfoResponse.status, errorText);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
    }

    const userInfo: GarUserInfo = await userInfoResponse.json();
    console.log('[GAR-CALLBACK] User info received:', userInfo);

    console.log('[GAR-CALLBACK] User info received:', userInfo);
    console.log('[GAR-CALLBACK] Signing user into NextAuth session via "gar-credentials" provider...');

    await signIn("gar-credentials", { // <-- Use the correct ID here
      userProfile: JSON.stringify(userInfo),
      redirectTo: callbackUrl, // The final destination after login
    });
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw the error so Next.js can handle the redirect
    }

    // Handle all other, actual errors
    console.error('[GAR-CALLBACK] Unexpected error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/connexion?error=OAuthCallback`);
  }
}

