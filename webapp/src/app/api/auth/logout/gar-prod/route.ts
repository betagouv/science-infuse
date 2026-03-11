import { NextRequest, NextResponse } from 'next/server';

/**
 * PFPROD logout endpoint declared to GAR.
 *
 * Responsibility here is minimal:
 * - Clear our GAR user session cookie if present.
 * - Redirect the user back to the main application entry point.
 *
 * Actual GAR IdP logout (end-session) is still initiated from the frontend
 * via the GAR end-session endpoint, as implemented in `LogoutButton`.
 */
export async function GET(_req: NextRequest) {
  const redirectTarget =
    process.env.NEXT_PUBLIC_WEBAPP_URL ||
    process.env.NEXTAUTH_URL ||
    '/';

  const response = NextResponse.redirect(redirectTarget);
  response.cookies.delete('gar_user_session');

  return response;
}

