# Eleventy → Astro + Keystatic Migration Plan

**Date:** December 31, 2025  
**Status:** Approved  
**Current Stack:** Eleventy 3.x + Liquid templates + SCSS + Cloudflare Pages  
**Target Stack:** Astro 5.x + Keystatic CMS + SCSS + Cloudflare Pages

---

## Executive Summary

This plan migrates the piranha-stories site from Eleventy to Astro with Keystatic CMS integration. The migration preserves all existing functionality while adding a modern content management experience.

### Approved Decisions

1. ✅ **Simplified URLs** - Posts move from `/2018/02/09/slug/` to `/slug/` with 301 redirects
2. ✅ **GitHub Repo** - `jasonm4130/piranha-stories` for Keystatic storage
3. ✅ **MDX Content** - Migrate to MDX for richer editing capabilities

### Migration Goals

1. ✅ Modern framework with first-class TypeScript support
2. ✅ Native Keystatic CMS integration with GitHub OAuth
3. ✅ Preserve existing URL structure and SEO (via redirects)
4. ✅ Maintain SCSS/Hydeout styling
5. ✅ Continue deploying to Cloudflare Pages
6. ✅ Improve developer experience

---

## Phase 1: Astro Project Setup

**Objective:** Initialize a new Astro project with all required dependencies and configuration.

**Estimated Time:** 1-2 hours

### Files to Create

- `astro.config.mjs` - Astro configuration with hybrid output, React, Keystatic, Cloudflare adapter
- `package.json` - Dependencies for Astro 5.x, Keystatic, React, SCSS
- `tsconfig.json` - TypeScript configuration with path aliases
- `keystatic.config.ts` - Keystatic CMS configuration
- `src/env.d.ts` - Astro environment types

### Key Configuration

- **Output Mode:** Hybrid (static by default, SSR for Keystatic routes)
- **Adapter:** @astrojs/cloudflare with nodejs_compat
- **Integrations:** React (for Keystatic), Keystatic

### Testing Criteria

- [ ] `npm run dev` starts without errors
- [ ] Visit `http://localhost:4321` shows default Astro page
- [ ] Visit `http://localhost:4321/keystatic` shows Keystatic admin
- [ ] TypeScript compilation succeeds

---

## Phase 2: Content Migration

**Objective:** Migrate all Markdown posts to Astro's content collections while preserving frontmatter structure.

**Estimated Time:** 1 hour

### Tasks

1. Create content collection schema in `src/content/config.ts`
2. Migrate 13 posts from `_posts/` to `src/content/posts/`
3. Normalize frontmatter (remove `layout`, add empty arrays for tags/categories)
4. Migrate about page to `src/content/pages/`

### URL Mapping

| Old URL | New URL | Redirect |
|---------|---------|----------|
| `/2018/02/09/judgement-day/` | `/judgement-day/` | 301 |
| `/2017/11/25/the-great-gummy-war/` | `/the-great-gummy-war/` | 301 |
| ... | ... | ... |

### Testing Criteria

- [ ] All 13 posts migrated to `src/content/posts/`
- [ ] About page migrated to `src/content/pages/`
- [ ] `npm run build` succeeds with no schema validation errors

---

## Phase 3: Layout Conversion

**Objective:** Convert Eleventy Liquid layouts to Astro components.

**Estimated Time:** 2-3 hours

### Layouts to Convert

| Eleventy Layout | Astro Layout |
|-----------------|--------------|
| `default.html` | `BaseLayout.astro` |
| `post.html` | `PostLayout.astro` |
| `page.html` | `PageLayout.astro` |
| `index.html` | `IndexLayout.astro` |

### Testing Criteria

- [ ] All layouts render without errors
- [ ] Body classes match original
- [ ] Layout nesting works correctly

---

## Phase 4: Component Conversion

**Objective:** Convert all Eleventy includes to Astro components.

**Estimated Time:** 2-3 hours

### Components to Create

- `Head.astro` - Meta tags, favicons, CSS
- `Sidebar.astro` - Navigation sidebar
- `PostMeta.astro` - Date and categories
- `PostTags.astro` - Tag links
- `Pagination.astro` - Newer/older links
- `RelatedPosts.astro` - Recent posts list
- `Comments.astro` - Disqus integration
- `SearchForm.astro` - Search functionality
- `icons/*.astro` - SVG icon components

### Testing Criteria

- [ ] All components render without TypeScript errors
- [ ] Props are properly typed
- [ ] SVG icons display correctly

---

## Phase 5: SCSS Integration

**Objective:** Migrate the Hydeout SCSS theme to work with Astro's styling system.

**Estimated Time:** 1-2 hours

### Tasks

1. Copy SCSS files to `src/styles/`
2. Update `@import` to `@use` syntax
3. Configure Astro's Vite SCSS options

### Testing Criteria

- [ ] SCSS compiles without errors
- [ ] All theme variables accessible
- [ ] Responsive design works

---

## Phase 6: Pages & Routing

**Objective:** Create Astro pages with dynamic routing for posts and pagination.

**Estimated Time:** 2-3 hours

### Pages to Create

- `src/pages/index.astro` - Home page (page 1)
- `src/pages/page/[page].astro` - Pagination
- `src/pages/[...slug].astro` - Dynamic post pages
- `src/pages/about.astro` - About page
- `src/pages/tags.astro` - Tags listing
- `src/pages/search.astro` - Search page
- `src/pages/feed.xml.ts` - RSS feed
- `src/pages/keystatic/[...params].astro` - Keystatic UI
- `src/pages/api/keystatic/[...params].ts` - Keystatic API

### Testing Criteria

- [ ] Pagination works correctly
- [ ] Post pages render
- [ ] RSS feed validates
- [ ] Keystatic admin accessible

---

## Phase 7: Keystatic CMS Setup

**Objective:** Configure Keystatic for local development and GitHub production mode.

**Estimated Time:** 1-2 hours

### Tasks

1. Configure local storage for development
2. Set up GitHub App for production
3. Add environment variables to Cloudflare

### Environment Variables

```
KEYSTATIC_GITHUB_CLIENT_ID=xxx
KEYSTATIC_GITHUB_CLIENT_SECRET=xxx
KEYSTATIC_SECRET=xxx
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=xxx
```

### Testing Criteria

- [ ] Local mode works
- [ ] Can create/edit posts locally
- [ ] GitHub App configured

---

## Phase 8: Deployment & Migration

**Objective:** Deploy to Cloudflare Pages and perform final migration.

**Estimated Time:** 2-3 hours

### Tasks

1. Copy static assets to `public/`
2. Create URL redirects for old URLs
3. Deploy to Cloudflare Pages
4. Remove old Eleventy files

### Files to Remove

- `.eleventy.js`
- `_layouts/`, `_includes/`, `_posts/`, `_sass/`, `_data/`
- `index.html`, `search.html`, `tags.html`, `404.html`
- `admin/`

### Testing Criteria

- [ ] Production build succeeds
- [ ] All pages accessible
- [ ] Old URLs redirect properly
- [ ] Keystatic admin works in production

---

## Timeline Summary

| Phase | Task | Time |
|-------|------|------|
| 1 | Astro Project Setup | 1-2 hours |
| 2 | Content Migration | 1 hour |
| 3 | Layout Conversion | 2-3 hours |
| 4 | Component Conversion | 2-3 hours |
| 5 | SCSS Integration | 1-2 hours |
| 6 | Pages & Routing | 2-3 hours |
| 7 | Keystatic CMS Setup | 1-2 hours |
| 8 | Deployment & Migration | 2-3 hours |
| **Total** | | **12-19 hours** |
