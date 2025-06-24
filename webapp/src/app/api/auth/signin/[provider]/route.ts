// webapp/src/app/api/auth/signin/[provider]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Helper functions for PKCE
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

function generateState(): string {
  return crypto.randomBytes(16).toString('base64url');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider } = params;
  const { searchParams } = new URL(request.url);
  
  console.log(`[AUTH] Handling signin request for provider: ${provider}`);
  
  try {
    if (provider === 'gar') {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      const state = generateState();
      
      console.log(`[AUTH] Generated PKCE parameters for GAR OAuth flow`);
      
      // Store code_verifier and state in cookies for the callback
      // Note: In production, consider using encrypted cookies or session storage
      const response = new NextResponse();
      
      // Store PKCE and state data (expires in 10 minutes)
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 600, // 10 minutes
        path: '/',
      };
      
      response.cookies.set('gar_code_verifier', codeVerifier, cookieOptions);
      response.cookies.set('gar_state', state, cookieOptions);
      response.cookies.set('gar_callback_url', callbackUrl, cookieOptions);
      
      // Build the OAuth authorization URL
      const authParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.GAR_CLIENT_ID!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/gar`,
        scope: 'openid scope.gar',
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        idRessource: process.env.GAR_ID_RESSOURCE!,
      });
      
      const authorizationUrl = `https://idp-auth.partenaire.test-gar.education.fr/oidc/oidcAuthorize?${authParams.toString()}`;
      
      console.log(`[AUTH] Redirecting to GAR authorization: ${authorizationUrl}`);
      
      // Set the redirect
      return NextResponse.redirect(authorizationUrl, {
        headers: response.headers,
      });
    }
    
    // For other providers, return error
    console.error(`[AUTH] Unsupported provider: ${provider}`);
    return NextResponse.json({ error: 'Provider not supported' }, { status: 400 });
    
  } catch (error) {
    console.error(`[AUTH] Error in signin handler for ${provider}:`, error);
    
    const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL || 'https://ada.beta.gouv.fr';
    const errorUrl = new URL('/connexion', baseUrl);
    errorUrl.searchParams.set('error', 'OAuthSignin');
    errorUrl.searchParams.set('provider', provider);
    
    return NextResponse.redirect(errorUrl.toString());
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  // Handle POST requests the same way as GET
  return GET(request, { params });
}