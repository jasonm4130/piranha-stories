# GitHub Copilot Instructions

## Project Overview

Piranha Stories is a short story blog built with:
- **Framework**: Astro 5.x with static output and hybrid SSR for CMS routes
- **CMS**: Keystatic with GitHub storage (production) / local storage (development)
- **Hosting**: Cloudflare Pages
- **Styling**: SCSS using the Hydeout theme (modernized for Dart Sass 3.0)

## Architecture

```
src/
├── content/           # Markdown content (posts + pages)
│   ├── posts/         # Blog posts (.md files with YAML frontmatter)
│   ├── pages/         # Static pages (about, etc.)
│   └── config.ts      # Astro content collection schemas
├── layouts/           # Astro layout components
│   ├── BaseLayout.astro    # Main HTML shell with sidebar
│   ├── IndexLayout.astro   # Homepage with post list
│   └── PostLayout.astro    # Individual post pages
├── pages/             # Astro page routes
├── styles/            # SCSS styles (Hydeout theme)
│   ├── main.scss      # Entry point
│   └── hydeout/       # Theme partials
└── components/        # Reusable Astro components
```

## Key Files

- `astro.config.mjs` - Astro configuration with Cloudflare adapter
- `keystatic.config.ts` - CMS configuration (posts + pages collections)
- `wrangler.toml` - Cloudflare Pages deployment config
- `src/content/config.ts` - Content collection schemas

## Content Format

Posts use standard Markdown with YAML frontmatter:
```yaml
---
title: Post Title
date: 2024-01-01
tags: []
categories: []
excerpt: Optional excerpt
---

Post content here...
```

## Commands

- `npm run dev` - Start development server (http://localhost:4321)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- Local CMS: http://localhost:4321/keystatic
- Production CMS: https://www.piranhastories.com/keystatic

## Deployment

The site deploys to Cloudflare Pages. To deploy manually:
```bash
npm run build
npx wrangler pages deployment create dist --project-name=piranha-stories --branch=master
```

## Coding Standards

### SCSS
- Use `@use` instead of deprecated `@import`
- Use `color.adjust()` instead of deprecated `lighten()`/`darken()`
- Variables are in `src/styles/hydeout/_variables.scss`

### Astro
- Use TypeScript in frontmatter
- Import styles with `@styles/` alias
- Import layouts with `@layouts/` alias
- Content collections are accessed via `getCollection('posts')` or `getCollection('pages')`

### Content
- Posts go in `src/content/posts/` as `.md` files
- Pages go in `src/content/pages/` as `.md` files
- Slugs are derived from filenames (kebab-case)

## Environment Variables (Production)

Required for Keystatic GitHub mode:
- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET`
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

These are stored as Cloudflare Pages secrets (not in repo).
