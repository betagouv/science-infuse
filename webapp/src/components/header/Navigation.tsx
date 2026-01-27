"use client";

import { MainNavigation } from "@codegouvfr/react-dsfr/MainNavigation";
import { usePathname, useSelectedLayoutSegments } from "next/navigation";
import { useSession } from "next-auth/react";
import { styled, Tooltip } from "@mui/material";
import { LockIcon } from "lucide-react";
import SearchBar from "../search/SearchBar";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import { Theme, UserRoles } from "@prisma/client";
import { apiClient } from "@/lib/api-client";
import useWindowSize from "@/course_editor/hooks/useWindowSize";

// Styled Components
const StyledMainNavigation = styled(MainNavigation)`
  .fr-nav__list {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    @media (min-width: 992px) {
      flex-direction: row;
      flex-grow: 1;
      align-items: center;
    }
  }

  .fr-nav__item {
    width: 100%;
    @media (min-width: 992px) {
      width: auto;
    }
  }

  .fr-nav {
    width: 100%;
  }

  #navBarSearchContainer {
    width: 100%;
    @media (min-width: 992px) {
      width: auto;
    }
  }
`;

// Navigation Configuration
const NAV_CONFIG = {
  HIDE_SEARCH_PATHS: ['/', '/connexion'],
  
  ACCOUNT_MENU: {
    text: 'Mon compte',
    links: [
      { path: 'prof/mes-cours', text: 'Mes cours' },
      { path: 'prof/mes-favoris', text: 'Mes contenus favoris' },
      { path: 'prof/mes-interactifs', text: 'Mes contenus interactifs' },
      { path: 'prof/parametres', text: 'Paramètres du compte' },
    ],
    adminLink: { path: 'admin/utilisateurs', text: 'Espace admin' },
    logoutLink: { path: 'deconnexion', text: 'Se déconnecter' },
  },

  COURSES_MENU: {
    text: 'Cours',
    catalogPath: 'catalogue',
    catalogText: 'Catalogue de cours SVT / Collège',
    creationLink: { path: 'prof/mes-cours', text: 'Création de cours' },
  },

  MAIN_LINKS: {
    interactiveActivities: {
      text: 'Activités interactives',
      links: [
        { path: 'intelligence-artificielle/dialogcards', text: 'Dialogcards' },
        { path: 'intelligence-artificielle/texte-a-trous', text: 'Texte à trous' },
        { path: 'intelligence-artificielle/mots-croises', text: 'Mots croisés' },
        { path: 'intelligence-artificielle/quizz', text: 'Quizz' },
        { path: 'intelligence-artificielle/video-interactive', text: 'Vidéo Interactive' },
        { path: 'intelligence-artificielle/image-a-completer', text: 'Image à compléter' },
      ],
    },
    inspirations: {
      text: 'Inspirations',
      links: [
        { path: 'webinaires', text: 'Webinaires Ada' },
        { path: '#', text: 'Contenus favoris de la communauté Ada (à venir)' },
      ],
    },
    help: {
      path: 'besoin-d-aide',
      text: 'Aide',
    },
    chatbot: {
      path: 'intelligence-artificielle/chatbot',
      text: 'Chatbot',
      betaOnly: true,
    },
  },
};

// Helper Functions
const isActiveSegment = (segments: string[], path: string) => {
  return segments.join('/') === path;
};

const isActiveRoot = (segments: string[], root: string) => {
  return segments[0] === root;
};

// Components
const NavBarSearch = () => {
  const pathname = usePathname();

  if (NAV_CONFIG.HIDE_SEARCH_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <div id="navBarSearchContainer" className="w-full lg:w-auto lg:min-w-[30rem]">
      <SearchBar />
    </div>
  );
};

// Navigation Builder Functions
const buildAccountMenu = (segments: string[], user: any, isMobile: boolean) => {
  if (!user || !isMobile) return [];

  const menuLinks = [
    ...NAV_CONFIG.ACCOUNT_MENU.links.map(link => ({
      isActive: isActiveSegment(segments, link.path),
      linkProps: { href: `/${link.path}`, target: '_self' },
      text: link.text,
    })),
  ];

  // Add admin link if user is admin
  if (user.roles?.includes(UserRoles.ADMIN)) {
    menuLinks.push({
      isActive: isActiveRoot(segments, 'admin'),
      linkProps: {
        href: `/${NAV_CONFIG.ACCOUNT_MENU.adminLink.path}`,
        target: '_self',
      },
      text: NAV_CONFIG.ACCOUNT_MENU.adminLink.text,
    });
  }

  // Add logout link
  menuLinks.push({
    isActive: false,
    text: NAV_CONFIG.ACCOUNT_MENU.logoutLink.text,
    linkProps: {
      href: `/${NAV_CONFIG.ACCOUNT_MENU.logoutLink.path}`,
      target: '_self',
    },
  });

  return [{
    text: NAV_CONFIG.ACCOUNT_MENU.text,
    isActive: isActiveRoot(segments, 'prof') || isActiveRoot(segments, 'admin'),
    menuLinks,
  }];
};

const buildCoursesMenu = (segments: string[], user: any) => {
  const menuLinks = [];

  // Add creation link for authenticated users
  if (user) {
    menuLinks.push({
      isActive: isActiveSegment(segments, NAV_CONFIG.COURSES_MENU.creationLink.path),
      linkProps: {
        href: `/${NAV_CONFIG.COURSES_MENU.creationLink.path}`,
        target: '_self',
      },
      text: NAV_CONFIG.COURSES_MENU.creationLink.text,
    });
  }

  // Add catalog link
  menuLinks.push({
    linkProps: { href: `/${NAV_CONFIG.COURSES_MENU.catalogPath}` },
    isActive: isActiveSegment(segments, NAV_CONFIG.COURSES_MENU.catalogPath),
    text: NAV_CONFIG.COURSES_MENU.catalogText,
  });

  return {
    isActive: isActiveRoot(segments, NAV_CONFIG.COURSES_MENU.catalogPath),
    text: NAV_CONFIG.COURSES_MENU.text,
    menuLinks,
  };
};

const buildMainLinks = (segments: string[], user: any) => {
  const links = [];


  // Interactive Activities menu
  links.push({
    isActive: isActiveRoot(segments, 'activites'),
    menuLinks: NAV_CONFIG.MAIN_LINKS.interactiveActivities.links.map(link => ({
      linkProps: { href: `/${link.path}` },
      isActive: isActiveSegment(segments, link.path),
      text: link.text,
    })),
    text: NAV_CONFIG.MAIN_LINKS.interactiveActivities.text,
  });

  // Inspirations menu
  links.push({
    isActive: isActiveSegment(segments, 'webinaires'),
    menuLinks: NAV_CONFIG.MAIN_LINKS.inspirations.links.map(link => ({
      linkProps: { href: `/${link.path}` },
      isActive: isActiveSegment(segments, link.path),
      text: link.text,
    })),
    text: NAV_CONFIG.MAIN_LINKS.inspirations.text,
  });

  // Help link
  links.push({
    isActive: isActiveSegment(segments, NAV_CONFIG.MAIN_LINKS.help.path),
    linkProps: {
      href: `/${NAV_CONFIG.MAIN_LINKS.help.path}`,
      target: '_self',
    },
    text: NAV_CONFIG.MAIN_LINKS.help.text,
  });

  // Chatbot (beta testers only)
  if (user?.roles?.includes(UserRoles.BETA_TESTER)) {
    links.push({
      isActive: isActiveSegment(segments, NAV_CONFIG.MAIN_LINKS.chatbot.path),
      linkProps: {
        href: `/${NAV_CONFIG.MAIN_LINKS.chatbot.path}`,
        target: '_self',
      },
      text: (
        <Tooltip title="Réservé aux bêta-testeurs">
          <span className="flex items-center justify-start gap-2">
            {NAV_CONFIG.MAIN_LINKS.chatbot.text} <LockIcon size={12} />
          </span>
        </Tooltip>
      ),
    });
  }

  return links;
};

// Main Component
export function Navigation() {
  const { data: session, update } = useSession();
  const user = session?.user;
  const segments = useSelectedLayoutSegments();
  const { isMobile } = useWindowSize();

  const [themes, setThemes] = useState<Theme[]>([]);

  useEffect(() => {
    // Periodically refresh session to pick up role changes (like being accepted into Club Ada)
    const interval = setInterval(() => {
      update();
    }, 1000 * 60 * 5); // Every 5 minutes

    return () => clearInterval(interval);
  }, [update]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const fetchedThemes = await apiClient.getThemes();
        setThemes(fetchedThemes);
      } catch (error) {
        console.error("Error fetching themes:", error);
      }
    };

    fetchThemes();
  }, []);

  const navigationItems = [
    ...buildAccountMenu(segments, user, isMobile),
    buildCoursesMenu(segments, user),
    ...buildMainLinks(segments, user),
  ];

  return (
    <div className="flex flex-col-reverse gap-8 w-full lg:flex-row lg:items-center">
      <StyledMainNavigation
        className="w-full"
        id="navigation"
        items={navigationItems}
      />
      <NavBarSearch />
    </div>
  );
}