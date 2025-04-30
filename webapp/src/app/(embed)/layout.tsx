// app/(embed)/layout.tsx (NEW - Minimal layout for the (embed) group)
import React from 'react';

// This layout applies ONLY to routes inside the (embed) group.
// Crucially, it does NOT render the children from the main app/layout.tsx.
// It essentially replaces the body content provided by the root layout
// for the routes it governs. It still *inherits* the <html> and <head>
// from the root app/layout.tsx, but we will override the <body> content.

export default function EmbedGroupLayout({ children }: { children: React.ReactNode }) {
  // We return ONLY the children for this segment.
  // This effectively stops the main layout's <body> content (Providers, Header, Footer etc.)
  // from rendering around the content of routes within this group.
  // The <html> and <head> elements from the root layout WILL still be present in the final HTML.
  return <>{children}</>;

  // If you needed *absolute* bare minimum, you might try rendering
  // a completely new html/body structure here, but Next.js might warn
  // against nested <html> tags. Returning just children is safer.
}