import { type HomeLayoutProps } from 'fumadocs-ui/home-layout';

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/layout.tsx
 */
export const baseOptions: HomeLayoutProps = {
  nav: {
    title: 'Science Infuse',
  },
  links: [
    {
      text: 'Documentation',
      url: '/',
      active: 'nested-url',
    },
  ],
};
