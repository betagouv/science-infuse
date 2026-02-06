'use server';

import { auth } from '@/auth';
import { userIs } from '@/app/api/accessControl';
import { UserRoles } from '@prisma/client';
import { redirect } from 'next/navigation';

/**
 * Server component access control. Redirects to /acces-requis on failure.
 * 
 * @param allowedRoles - Array of roles to allow, or '*' for any authenticated user
 */
export async function requireAccess(...allowedRoles: (UserRoles | '*')[]): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    redirect('/acces-requis');
  }

  // '*' means any authenticated user
  if (allowedRoles.includes('*')) {
    return;
  }

  const rolesList = allowedRoles.filter((r): r is UserRoles => r !== '*');
  const hasRole = await userIs(session.user.id, rolesList);

  if (!hasRole) {
    redirect('/acces-requis');
  }
}

/** Require any authenticated user */
export async function requireAuthenticated(): Promise<void> {
  await requireAccess('*');
}
