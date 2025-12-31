# Keystatic CMS Integration Research

**Date:** December 31, 2025  
**Status:** Research Complete  
**Current Setup:** Eleventy 3.x on Cloudflare Pages with Decap CMS

---

## Executive Summary

**Recommendation: Option B - Migrate to Astro with Keystatic**

Keystatic requires server-side Node.js API routes for GitHub authentication, which pure static site generators like Eleventy cannot provide. The best approach is to migrate to **Astro** (which has first-class Keystatic support) and deploy on **Cloudflare Pages** with hybrid rendering (static pages + SSR for Keystatic admin).

---

## Research Findings

### 1. Keystatic Compatibility with Eleventy

**❌ Keystatic does NOT support pure Eleventy sites**

Keystatic officially supports only:
- Next.js
- Astro
- Remix

**Why Keystatic requires a meta-framework:**
- **GitHub mode** requires server-side API routes for OAuth authentication
- Keystatic needs to handle OAuth callbacks from GitHub
- These API routes must run on a Node.js server at runtime
- Pure static site generators (like Eleventy) output only HTML/CSS/JS files with no server-side capabilities

### 2. Architecture Options Analysis

#### Option A: Keep Eleventy + Separate Keystatic Admin App ❌
**Not Recommended**

| Pros | Cons |
|------|------|
| Keeps existing site unchanged | Two separate deployments to maintain |
| | Complex setup with GitHub webhooks |
| | Content syncing issues between apps |
| | Poor developer experience |

**Implementation complexity:** Very High  
**Maintenance burden:** Very High

#### Option B: Migrate to Astro ✅ **RECOMMENDED**
**Best Choice for Your Use Case**

| Pros | Cons |
|------|------|
| Native Keystatic support | Requires migration effort |
| Similar to Eleventy (file-based, Markdown-first) | Learning curve for Astro |
| Excellent Cloudflare Pages support | Some template adjustments needed |
| Static pages by default, SSR only where needed | |
| Same content format (Markdown + YAML frontmatter) | |
| Active development and community | |

**Implementation complexity:** Medium  
**Maintenance burden:** Low (single codebase)

#### Option C: Keystatic Cloud ⚡
**Alternative if you want minimal changes**

| Pros | Cons |
|------|------|
| No custom GitHub App setup needed | Still requires Astro/Next.js |
| Simplified authentication | Paid for teams >3 users ($10/mo + $5/user) |
| Image optimization included | Third-party dependency |
| Multi-player editing (Pro) | |

**Implementation complexity:** Medium  
**Maintenance burden:** Low

---

## Detailed Analysis: Astro Migration (Recommended Path)

### Why Astro is the Best Fit

1. **Similar philosophy to Eleventy:**
   - File-based routing
   - Markdown-first content
   - Static by default
   - Fast build times

2. **Cloudflare Pages compatibility:**
   - Official `@astrojs/cloudflare` adapter
   - Hybrid rendering (static + SSR)
   - Works with Cloudflare Functions/Workers

3. **Content format compatibility:**
   - Your existing `_posts/*.md` files can be migrated
   - Same YAML frontmatter structure
   - Keystatic can be configured to match your current folder structure

### Keystatic Configuration for Your Posts

Your current post format:
```
_posts/2018-02-09-judgement-day.md
---
layout: post
title: Judgement Day
date: 2018-02-09T00:42:12.041Z
---
```

Equivalent Keystatic config (`keystatic.config.ts`):
```typescript
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: {
    kind: 'github',
    repo: 'jasonm4130/piranha-stories',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: '_posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        date: fields.datetime({ 
          label: 'Publish Date',
          defaultValue: { kind: 'now' }
        }),
        content: fields.markdoc({ 
          label: 'Content',
          options: {
            // Enable YAML frontmatter output
          }
        }),
      },
    }),
  },
});
```

**Note on filename format:** Keystatic generates slugs from the `slugField`, so files would be named like `judgement-day.md` rather than `2018-02-09-judgement-day.md`. You have two options:
1. Accept the new naming convention (simpler)
2. Use a custom slug field that includes the date (requires additional setup)

---

## Technical Requirements

### For Astro + Keystatic on Cloudflare Pages

1. **Runtime Environment:**
   - Node.js compatibility mode in Cloudflare Workers
   - Hybrid output mode (static + server)

2. **Dependencies:**
   ```json
   {
     "@astrojs/cloudflare": "latest",
     "@astrojs/react": "latest",
     "@astrojs/markdoc": "latest",
     "@keystatic/core": "latest",
     "@keystatic/astro": "latest",
     "react": "^18",
     "react-dom": "^18"
   }
   ```

3. **Astro Configuration:**
   ```javascript
   // astro.config.mjs
   import { defineConfig } from 'astro/config';
   import react from '@astrojs/react';
   import markdoc from '@astrojs/markdoc';
   import keystatic from '@keystatic/astro';
   import cloudflare from '@astrojs/cloudflare';

   export default defineConfig({
     output: 'hybrid', // Static by default, SSR for /keystatic
     adapter: cloudflare(),
     integrations: [react(), markdoc(), keystatic()],
   });
   ```

4. **Wrangler Configuration:**
   ```toml
   name = "piranha-stories"
   compatibility_date = "2025-01-01"
   compatibility_flags = ["nodejs_compat"]
   
   [assets]
   binding = "ASSETS"
   directory = "./dist"
   ```

5. **Environment Variables (in Cloudflare Dashboard):**
   ```
   KEYSTATIC_GITHUB_CLIENT_ID=xxx
   KEYSTATIC_GITHUB_CLIENT_SECRET=xxx
   KEYSTATIC_SECRET=xxx
   PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=xxx
   ```

---

## Migration Steps

### Phase 1: Setup Astro Project (1-2 hours)
1. Create new Astro project alongside Eleventy
2. Install dependencies (Astro, Keystatic, Cloudflare adapter)
3. Configure `astro.config.mjs` with hybrid output
4. Create `keystatic.config.ts` with posts collection

### Phase 2: Migrate Content (1-2 hours)
1. Copy `_posts/*.md` files to Astro content directory
2. Adjust frontmatter if needed
3. Migrate static assets (`assets/img/`)

### Phase 3: Migrate Templates (2-4 hours)
1. Convert Liquid/Nunjucks templates to Astro components
2. Migrate layouts (post, page, default)
3. Migrate includes (sidebar, navigation, etc.)

### Phase 4: Migrate Styling (1-2 hours)
1. Copy SCSS files or convert to Astro-compatible setup
2. Configure PostCSS/Sass processing

### Phase 5: Setup Keystatic GitHub Mode (30 min)
1. Run dev server and visit `/keystatic`
2. Create GitHub App through the setup wizard
3. Grant repo access
4. Copy environment variables to Cloudflare dashboard

### Phase 6: Deploy & Test (1-2 hours)
1. Update Cloudflare Pages build configuration
2. Deploy and test admin functionality
3. Verify content editing workflow

**Total estimated time:** 6-12 hours

---

## Limitations & Tradeoffs

### Limitations of Keystatic
1. **Filename format:** Keystatic doesn't natively support date-prefixed filenames like `YYYY-MM-DD-slug.md`. You'd need to either:
   - Accept simpler slugs (`title.md`)
   - Implement custom slug generation

2. **No local file editing mode in production:** GitHub mode means all edits go through GitHub, not directly to the filesystem.

3. **Learning curve:** Need to understand Astro's component model.

### Tradeoffs
| Keep Eleventy + Decap | Move to Astro + Keystatic |
|----------------------|---------------------------|
| No migration effort | Initial migration work |
| Git Gateway dependency | Native GitHub OAuth |
| Limited editor UX | Modern, polished editor |
| Identity service required | Direct GitHub integration |
| No real-time preview | Real-time content preview |

---

## Alternative: Keystatic Cloud

If you want to simplify the GitHub authentication setup:

1. Sign up at [keystatic.cloud](https://keystatic.cloud)
2. Create a team and project
3. Connect to your GitHub repo
4. Update config to use `storage: { kind: 'cloud' }`

**Cost:** Free for up to 3 users, $10/mo + $5/user for Pro

---

## Comparison with Current Decap CMS

| Feature | Decap CMS (Current) | Keystatic |
|---------|-------------------|-----------|
| Authentication | Git Gateway (external) | GitHub OAuth (built-in) |
| Editor Interface | Functional | Modern, polished |
| Real-time Preview | Limited | Yes |
| Custom Fields | Basic | Rich (blocks, arrays, etc.) |
| Media Management | Basic | Integrated |
| Framework Support | Any static | Astro/Next.js/Remix |
| Self-hosted | Yes (widget) | Yes (with framework) |
| Cloud Option | Netlify Identity | Keystatic Cloud |

---

## Recommendation Summary

**Primary recommendation:** Migrate to Astro with Keystatic

**Reasons:**
1. Best long-term maintainability
2. Modern editing experience
3. Native Cloudflare Pages support
4. Active development and community
5. Your site is relatively simple, making migration straightforward

**Next steps if you want to proceed:**
1. Create a new Astro project in a separate branch
2. Follow the Astro + Keystatic installation guide
3. Migrate content and templates incrementally
4. Test locally with Keystatic in `local` mode first
5. Switch to `github` mode when ready for production

---

## Resources

- [Keystatic Docs](https://keystatic.com/docs)
- [Astro + Keystatic Guide](https://keystatic.com/docs/installation-astro)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Keystatic GitHub Mode](https://keystatic.com/docs/github-mode)
- [Keystatic Cloud](https://keystatic.cloud)
