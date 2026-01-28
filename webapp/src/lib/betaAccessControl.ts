'use server';

import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { AdminSettingKey, UserRoles } from '@prisma/client';
import { redirect } from 'next/navigation';

// Map of route paths to their corresponding feature flag setting keys
const BETA_ROUTES: Record<string, AdminSettingKey> = {
  '/intelligence-artificielle/dialogcards': AdminSettingKey.FEATURE_DIALOGCARDS_BETA_ONLY,
  '/intelligence-artificielle/texte-a-trous': AdminSettingKey.FEATURE_TEXTE_A_TROUS_BETA_ONLY,
  '/intelligence-artificielle/mots-croises': AdminSettingKey.FEATURE_MOTS_CROISES_BETA_ONLY,
  '/intelligence-artificielle/quizz': AdminSettingKey.FEATURE_QUIZZ_BETA_ONLY,
  '/intelligence-artificielle/video-interactive': AdminSettingKey.FEATURE_VIDEO_INTERACTIVE_BETA_ONLY,
  '/intelligence-artificielle/image-a-completer': AdminSettingKey.FEATURE_IMAGE_A_COMPLETER_BETA_ONLY,
  '/intelligence-artificielle/chatbot': AdminSettingKey.FEATURE_CHATBOT_BETA_ONLY,
};

/**
 * Checks if a user has beta access to a specific route.
 * If the route is restricted to beta users only and the user is not a beta tester,
 * they will be redirected to /prof/club-ada.
 * 
 * @param pathname - The current route pathname
 * @returns Promise<void>
 */
export async function checkBetaAccess(pathname: string): Promise<void> {
  // Find the matching route configuration
  const matchingRoute = Object.keys(BETA_ROUTES).find(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If route is not in the beta routes list, no check needed
  if (!matchingRoute) {
    return;
  }

  const settingKey = BETA_ROUTES[matchingRoute];

  // Get the session
  const session = await auth();
  const user = session?.user;

  // Check if user is a beta tester
  const isBetaTester = user?.roles?.includes(UserRoles.BETA_TESTER) ?? false;

  // If user is a beta tester, allow access
  if (isBetaTester) {
    return;
  }

  // Check if the feature is restricted to beta only
  const setting = await prisma.adminSetting.findUnique({
    where: { key: settingKey },
  });

  // If setting doesn't exist or is not set to 'true', allow access
  if (!setting || setting.value !== 'true') {
    return;
  }

  // Feature is restricted and user is not a beta tester, redirect to club-ada
  redirect('/prof/club-ada');
}

/**
 * Higher-order function to wrap page components with beta access control.
 * Use this in page.tsx files for routes that need beta access control.
 * 
 * @param pathname - The route pathname to check
 * @returns Promise<boolean> - true if access is allowed, false if redirected
 */
export async function requireBetaAccess(pathname: string): Promise<boolean> {
  try {
    await checkBetaAccess(pathname);
    return true;
  } catch (error) {
    // If redirect was triggered, this won't be reached
    // But if there was another error, we should handle it
    console.error('Error checking beta access:', error);
    return false;
  }
}
