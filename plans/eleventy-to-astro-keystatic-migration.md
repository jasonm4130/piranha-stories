# Eleventy → Astro + Keystatic Migration Plan

**Date:** December 31, 2025  
**Status:** Planning  
**Current Stack:** Eleventy 3.x + Liquid templates + SCSS + Cloudflare Pages  
**Target Stack:** Astro 5.x + Keystatic CMS + SCSS + Cloudflare Pages

---

## Executive Summary

This plan migrates the piranha-stories site from Eleventy to Astro with Keystatic CMS integration. The migration preserves all existing functionality while adding a modern content management experience.

### Current Architecture Analysis

| Component | Current Implementation |
|-----------|----------------------|
| **Build System** | Eleventy 3.x with Liquid templates |
| **Styling** | SCSS (Hydeout theme) with PostCSS/PurgeCSS |
| **Content** | 12 Markdown posts in `_posts/` with YAML frontmatter |
| **Layouts** | 7 layouts: default, post, page, index, tags, search, category |
| **Components** | 22 includes (sidebar, pagination, post-meta, etc.) |
| **Hosting** | Cloudflare Pages (static) |
| **CMS** | Decap CMS (admin/) |

### Migration Goals

1. ✅ Modern framework with first-class TypeScript support
2. ✅ Native Keystatic CMS integration with GitHub OAuth
3. ✅ Preserve existing URL structure and SEO
4. ✅ Maintain SCSS/Hydeout styling
5. ✅ Continue deploying to Cloudflare Pages
6. ✅ Improve developer experience

---

## Phase 1: Astro Project Setup

**Objective:** Initialize a new Astro project with all required dependencies and configuration.

**Estimated Time:** 1-2 hours

### Files to Create

```
astro-migration/           # Temporary parallel directory
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── keystatic.config.ts
├── wrangler.toml
└── src/
    └── env.d.ts
```

### 1.1 Initialize Astro Project

```bash
# Create new Astro project
npm create astro@latest astro-migration -- --template minimal --install

# Navigate to project
cd astro-migration

# Install dependencies
npm install @astrojs/cloudflare @astrojs/react @keystatic/core @keystatic/astro react react-dom
npm install -D sass @types/react @types/react-dom
```

### 1.2 package.json

```json
{
  "name": "piranha-stories",
  "type": "module",
  "version": "2.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/cloudflare": "^12.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/rss": "^4.0.0",
    "@keystatic/astro": "^5.0.0",
    "@keystatic/core": "^0.5.0",
    "astro": "^5.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "sass": "^1.83.0",
    "typescript": "^5.0.0"
  }
}
```

### 1.3 astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://piranhastories.com',
  
  // Hybrid: static by default, SSR for /keystatic routes
  output: 'hybrid',
  
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  
  integrations: [
    react(),
    keystatic()
  ],
  
  // SCSS configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          includePaths: ['src/styles']
        }
      }
    }
  }
});
```

### 1.4 tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@styles/*": ["src/styles/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

### 1.5 keystatic.config.ts

```typescript
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: 
    process.env.NODE_ENV === 'development'
      ? { kind: 'local' }
      : {
          kind: 'github',
          repo: 'jasonm4130/piranha-stories',
        },
  
  ui: {
    brand: {
      name: 'Piranha Stories',
    },
    navigation: {
      Content: ['posts', 'pages'],
    },
  },
  
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({ 
          name: { label: 'Title' } 
        }),
        date: fields.datetime({ 
          label: 'Publish Date',
          defaultValue: { kind: 'now' }
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
          description: 'Optional custom excerpt for the post listing'
        }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          {
            label: 'Tags',
            itemLabel: props => props.value || 'New Tag',
          }
        ),
        categories: fields.array(
          fields.text({ label: 'Category' }),
          {
            label: 'Categories',
            itemLabel: props => props.value || 'New Category',
          }
        ),
        content: fields.mdx({
          label: 'Content',
        }),
      },
    }),
    
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        sidebarLink: fields.checkbox({
          label: 'Show in Sidebar',
          defaultValue: false
        }),
        content: fields.mdx({
          label: 'Content',
        }),
      },
    }),
  },
});
```

### 1.6 wrangler.toml

```toml
name = "piranha-stories"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

pages_build_output_dir = "dist"

[vars]
NODE_VERSION = "20"
```

### Testing Criteria

- [ ] `npm run dev` starts without errors
- [ ] Visit `http://localhost:4321` shows default Astro page
- [ ] Visit `http://localhost:4321/keystatic` shows Keystatic admin (local mode)
- [ ] TypeScript compilation succeeds

---

## Phase 2: Content Migration

**Objective:** Migrate all Markdown posts to Astro's content collections while preserving frontmatter structure.

**Estimated Time:** 1 hour

### Directory Structure

```
src/
├── content/
│   ├── config.ts           # Content collection schemas
│   ├── posts/              # Migrated from _posts/
│   │   ├── hunt-for-the-dragon-emperor.md
│   │   ├── the-recorder.md
│   │   ├── number-238993.md
│   │   └── ... (12 posts)
│   └── pages/
│       └── about.md
└── ...
```

### 2.1 Content Collection Schema (src/content/config.ts)

```typescript
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    layout: z.string().optional(), // For migration compatibility
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    sidebarLink: z.boolean().optional(),
    layout: z.string().optional(),
  }),
});

export const collections = { posts, pages };
```

### 2.2 Post Migration Script

Create a helper script to migrate posts:

```bash
# scripts/migrate-posts.sh
#!/bin/bash

# Create content directories
mkdir -p src/content/posts
mkdir -p src/content/pages

# Copy posts (removing date prefix from filename)
for file in _posts/*.md; do
  # Extract filename without path
  filename=$(basename "$file")
  
  # Remove date prefix (YYYY-MM-DD-)
  newname=$(echo "$filename" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-//')
  
  # Copy with new name
  cp "$file" "src/content/posts/$newname"
  
  echo "Migrated: $filename -> $newname"
done

# Copy about page
cp about.md src/content/pages/
```

### 2.3 Frontmatter Adjustments

**Current format (Eleventy):**
```yaml
---
layout: post
title: Judgement Day
date: 2018-02-09T00:42:12.041Z
---
```

**Target format (Astro):**
```yaml
---
title: Judgement Day
date: 2018-02-09T00:42:12.041Z
tags: []
categories: []
---
```

Note: Remove `layout` from frontmatter (handled by Astro routing).

### Testing Criteria

- [ ] All 12 posts migrated to `src/content/posts/`
- [ ] About page migrated to `src/content/pages/`
- [ ] `npm run build` succeeds with no schema validation errors
- [ ] Content can be queried via `getCollection('posts')`

---

## Phase 3: Layout Conversion

**Objective:** Convert Eleventy Liquid layouts to Astro components.

**Estimated Time:** 2-3 hours

### Directory Structure

```
src/
├── layouts/
│   ├── BaseLayout.astro      # From default.html
│   ├── PostLayout.astro      # From post.html
│   ├── PageLayout.astro      # From page.html
│   └── IndexLayout.astro     # From index.html
└── ...
```

### 3.1 BaseLayout.astro (from default.html)

```astro
---
import Head from '@components/Head.astro';
import Sidebar from '@components/Sidebar.astro';
import '@styles/main.scss';

interface Props {
  title: string;
  description?: string;
  layout?: string;
}

const { title, description, layout = 'default' } = Astro.props;
const isHome = Astro.url.pathname === '/';
---

<!DOCTYPE html>
<html lang="en-us">
  <Head title={title} description={description} />
  
  <body class:list={[layout, { home: isHome }]}>
    <Sidebar layout={layout} currentPath={Astro.url.pathname} />
    
    <main class="container">
      <slot />
    </main>
    
    <!-- Custom footer scripts -->
    <slot name="footer" />
  </body>
</html>
```

### 3.2 PostLayout.astro (from post.html)

```astro
---
import BaseLayout from './BaseLayout.astro';
import PostMeta from '@components/PostMeta.astro';
import PostTags from '@components/PostTags.astro';
import Comments from '@components/Comments.astro';
import RelatedPosts from '@components/RelatedPosts.astro';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'posts'>;
}

const { post } = Astro.props;
const { title, date, tags, categories } = post.data;
---

<BaseLayout title={title} layout="post">
  <header>
    <h1 class="post-title">{title}</h1>
  </header>
  
  <div class="content">
    <PostMeta date={date} categories={categories} />
    
    <div class="post-body">
      <slot />
      <PostTags tags={tags} />
    </div>
    
    <Comments />
    <RelatedPosts currentSlug={post.slug} />
  </div>
</BaseLayout>
```

### 3.3 PageLayout.astro (from page.html)

```astro
---
import BaseLayout from './BaseLayout.astro';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<BaseLayout title={title} layout="page">
  <header>
    <h1 class="page-title">{title}</h1>
  </header>
  
  <div class="content">
    <slot />
  </div>
</BaseLayout>
```

### 3.4 IndexLayout.astro (from index.html)

```astro
---
import BaseLayout from './BaseLayout.astro';
import PostMeta from '@components/PostMeta.astro';
import Pagination from '@components/Pagination.astro';
import type { Page } from 'astro';
import type { CollectionEntry } from 'astro:content';

interface Props {
  page: Page<CollectionEntry<'posts'>>;
}

const { page } = Astro.props;
---

<BaseLayout title="Home" layout="index">
  <div class="content">
    {page.url.prev && (
      <Pagination href={page.url.prev} direction="newer" />
    )}
    
    <slot />
    
    {page.data.map((post) => (
      <article class="post-body">
        <h2 class="post-title">
          <a href={`/${post.slug}/`}>{post.data.title}</a>
        </h2>
        <PostMeta date={post.data.date} categories={post.data.categories} />
        
        {post.data.excerpt ? (
          <>
            <Fragment set:html={post.data.excerpt} />
            <a href={`/${post.slug}/`}>More &hellip;</a>
          </>
        ) : (
          <Fragment set:html={post.body.slice(0, 500)} />
        )}
      </article>
    ))}
    
    {page.url.next && (
      <Pagination href={page.url.next} direction="older" />
    )}
  </div>
</BaseLayout>
```

### Layout Mapping Reference

| Eleventy Layout | Astro Layout | Notes |
|----------------|--------------|-------|
| `default.html` | `BaseLayout.astro` | Base wrapper with head/sidebar |
| `post.html` | `PostLayout.astro` | Single post display |
| `page.html` | `PageLayout.astro` | Static pages (about, etc.) |
| `index.html` | `IndexLayout.astro` | Home with pagination |
| `tags.html` | Used in `src/pages/tags.astro` | Tags listing page |
| `search.html` | Used in `src/pages/search.astro` | Search page |
| `category.html` | (Remove or convert) | Optional |

### Testing Criteria

- [ ] All layouts render without errors
- [ ] Body classes match original (`post`, `page`, `index`, `home`)
- [ ] Sidebar displays correctly on all pages
- [ ] Layout nesting works (PostLayout → BaseLayout)

---

## Phase 4: Component Conversion

**Objective:** Convert all Eleventy includes to Astro components.

**Estimated Time:** 2-3 hours

### Directory Structure

```
src/
├── components/
│   ├── Head.astro
│   ├── Sidebar.astro
│   ├── PostMeta.astro
│   ├── PostTags.astro
│   ├── Pagination.astro
│   ├── RelatedPosts.astro
│   ├── Comments.astro
│   ├── SearchForm.astro
│   ├── TagsList.astro
│   ├── icons/               # SVG icons
│   │   ├── BackArrow.astro
│   │   ├── Feed.astro
│   │   ├── GitHub.astro
│   │   ├── Message.astro
│   │   ├── Search.astro
│   │   └── Tags.astro
│   └── sidebar/
│       ├── NavLinks.astro
│       └── IconLinks.astro
└── ...
```

### 4.1 Head.astro (from head.html)

```astro
---
import '../styles/main.scss';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;

const siteTitle = 'Piranha Stories';
const tagline = 'Short stories to brighten your day.';

const pageTitle = title === 'Home' 
  ? `${siteTitle} · ${tagline}` 
  : `${title} · ${siteTitle}`;

const metaDescription = description || `${tagline} ${siteTitle} - A collection of original short stories by Brian_AP.`;
---

<head>
  <link href="http://gmpg.org/xfn/11" rel="profile" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <meta name="description" content={metaDescription} />
  
  <title>{pageTitle}</title>
  
  <!-- Favicons -->
  <link rel="icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" href="/favicon.png" />
  
  <!-- RSS -->
  <link rel="alternate" type="application/rss+xml" title="RSS" href="/feed.xml" />
  
  <slot />
</head>
```

### 4.2 Sidebar.astro (from sidebar.html)

```astro
---
import NavLinks from './sidebar/NavLinks.astro';
import IconLinks from './sidebar/IconLinks.astro';
import BackArrow from './icons/BackArrow.astro';

interface Props {
  layout: string;
  currentPath: string;
}

const { layout, currentPath } = Astro.props;

const siteTitle = 'Piranha Stories';
const description = 'A collection of stories by <a href="//www.reddit.com/user/Brian_AP">Brian_AP</a>';

const isHome = currentPath === '/';
const isIndex = layout === 'index';
---

<div id="sidebar">
  <header>
    <img 
      class="logo" 
      src="/assets/img/logo-min.png" 
      alt="Piranha Stories logo" 
      width="150" 
      height="150" 
    />
    
    {isIndex ? (
      <h1 class="site-title">
        <a href="/">
          {!isHome && <span class="back-arrow icon"><BackArrow /></span>}
          {siteTitle}
        </a>
      </h1>
    ) : (
      <div class="site-title">
        <a href="/">
          {!isHome && <span class="back-arrow icon"><BackArrow /></span>}
          {siteTitle}
        </a>
      </div>
    )}
    
    <p class="lead" set:html={description} />
  </header>
  
  <NavLinks currentPath={currentPath} />
  <IconLinks currentPath={currentPath} />
</div>
```

### 4.3 PostMeta.astro (from post-meta.html)

```astro
---
interface Props {
  date: Date;
  categories?: string[];
}

const { date, categories } = Astro.props;

const formattedDate = date.toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
---

<div class="post-meta">
  <span class="post-date">{formattedDate}</span>
  
  {categories && categories.length > 0 && (
    <span class="post-categories">
      {categories.map((category) => (
        <>&bull; {category}</>
      ))}
    </span>
  )}
</div>
```

### 4.4 PostTags.astro (from post-tags.html)

```astro
---
import TagIcon from './icons/Tags.astro';

interface Props {
  tags?: string[];
}

const { tags } = Astro.props;

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
---

{tags && tags.length > 0 && (
  <div class="post-tags">
    {tags.map((tag) => (
      <a href={`/tags/#${slugify(tag)}`}>
        <span class="icon"><TagIcon /></span>
        <span class="tag-name">{tag}</span>
      </a>
    ))}
  </div>
)}
```

### 4.5 Pagination.astro (from pagination-*.html)

```astro
---
interface Props {
  href: string;
  direction: 'newer' | 'older';
}

const { href, direction } = Astro.props;
---

<div class="pagination">
  <a class={`pagination-item ${direction}`} href={href}>
    {direction === 'newer' ? 'Newer' : 'Older'}
  </a>
</div>
```

### 4.6 RelatedPosts.astro (from related_posts.html)

```astro
---
import { getCollection } from 'astro:content';

interface Props {
  currentSlug: string;
}

const { currentSlug } = Astro.props;

const allPosts = await getCollection('posts');
const recentPosts = allPosts
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .filter(post => post.slug !== currentSlug)
  .slice(0, 3);

const formattedDate = (date: Date) => date.toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
---

<section class="related">
  <h2>Related Posts</h2>
  <ul class="posts-list">
    {recentPosts.map((post) => (
      <li>
        <h3>
          <a href={`/${post.slug}/`}>
            {post.data.title}
            <small>{formattedDate(post.data.date)}</small>
          </a>
        </h3>
      </li>
    ))}
  </ul>
</section>
```

### 4.7 Comments.astro (from comments.html)

```astro
---
// Disqus integration
const disqusShortname = 'piranhastories-com';
---

<section id="disqus_thread"></section>

<script define:vars={{ disqusShortname }}>
  var disqus_config = function () {
    this.page.url = window.location.href;
    this.page.identifier = window.location.pathname;
  };
  
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://' + disqusShortname + '.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
</script>
```

### Component Mapping Reference

| Eleventy Include | Astro Component | Priority |
|-----------------|-----------------|----------|
| `head.html` | `Head.astro` | High |
| `sidebar.html` | `Sidebar.astro` | High |
| `post-meta.html` | `PostMeta.astro` | High |
| `post-tags.html` | `PostTags.astro` | High |
| `pagination-*.html` | `Pagination.astro` | High |
| `related_posts.html` | `RelatedPosts.astro` | Medium |
| `comments.html` | `Comments.astro` | Medium |
| `search-form.html` | `SearchForm.astro` | Medium |
| `tags-list.html` | `TagsList.astro` | Medium |
| `sidebar-nav-links.html` | `sidebar/NavLinks.astro` | High |
| `sidebar-icon-links.html` | `sidebar/IconLinks.astro` | High |
| `favicons.html` | Inline in `Head.astro` | Low |
| `font-includes.html` | Inline in `Head.astro` | Low |
| `custom-*.html` | Slots or inline | Low |
| `svg/*.svg` | `icons/*.astro` | High |

### Testing Criteria

- [ ] All components render without TypeScript errors
- [ ] Props are properly typed
- [ ] SVG icons display correctly
- [ ] Links work correctly
- [ ] Disqus comments load (if enabled)

---

## Phase 5: SCSS Integration

**Objective:** Migrate the Hydeout SCSS theme to work with Astro's styling system.

**Estimated Time:** 1-2 hours

### Directory Structure

```
src/
├── styles/
│   ├── main.scss          # Entry point
│   └── hydeout/
│       ├── _variables.scss
│       ├── _base.scss
│       ├── _type.scss
│       ├── _syntax.scss
│       ├── _code.scss
│       ├── _layout.scss
│       ├── _masthead.scss
│       ├── _posts.scss
│       ├── _pagination.scss
│       ├── _message.scss
│       ├── _search.scss
│       └── _tags.scss
└── ...
```

### 5.1 Migration Steps

```bash
# Copy SCSS files
mkdir -p src/styles/hydeout
cp _sass/hydeout.scss src/styles/main.scss
cp _sass/hydeout/*.scss src/styles/hydeout/
```

### 5.2 Update main.scss

```scss
// src/styles/main.scss

/*
  Hydeout theme for Astro
  Originally designed for Jekyll by @fongandrew
  Migrated from Eleventy setup
*/

@use "hydeout/variables" as *;
@use "hydeout/base";
@use "hydeout/type";
@use "hydeout/syntax";
@use "hydeout/code";
@use "hydeout/layout";
@use "hydeout/masthead";
@use "hydeout/posts";
@use "hydeout/pagination";
@use "hydeout/message";
@use "hydeout/search";
@use "hydeout/tags";
```

### 5.3 Update Variable Imports

Convert from `@import` to `@use` syntax in partials:

```scss
// src/styles/hydeout/_base.scss (example)
@use "variables" as *;

// Rest of styles use $variables directly
```

### 5.4 Astro SCSS Configuration

Already configured in `astro.config.mjs`:

```javascript
vite: {
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['src/styles']
      }
    }
  }
}
```

### 5.5 Import in Layout

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/main.scss';
---
```

### PurgeCSS Consideration

For production optimization, consider adding:

```javascript
// astro.config.mjs
import purgecss from '@fullhuman/postcss-purgecss';

export default defineConfig({
  vite: {
    css: {
      postcss: {
        plugins: [
          purgecss({
            content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
            safelist: [/^hljs/, /^prism/, /^token/]
          })
        ]
      }
    }
  }
});
```

### Testing Criteria

- [ ] SCSS compiles without errors
- [ ] All theme variables are accessible
- [ ] Sidebar styling matches original
- [ ] Typography matches original
- [ ] Responsive breakpoints work

---

## Phase 6: Pages & Routing

**Objective:** Create Astro pages with dynamic routing for posts and pagination.

**Estimated Time:** 2-3 hours

### Directory Structure

```
src/
├── pages/
│   ├── index.astro              # Home page (page 1)
│   ├── page/
│   │   └── [page].astro         # Pagination pages
│   ├── [...slug].astro          # Dynamic post pages
│   ├── about.astro              # Static about page
│   ├── tags.astro               # Tags listing
│   ├── search.astro             # Search page
│   ├── feed.xml.ts              # RSS feed
│   ├── keystatic/
│   │   └── [...params].astro    # Keystatic admin routes
│   └── api/
│       └── keystatic/
│           └── [...params].ts   # Keystatic API routes
└── ...
```

### 6.1 Home Page (src/pages/index.astro)

```astro
---
import { getCollection } from 'astro:content';
import IndexLayout from '@layouts/IndexLayout.astro';

const posts = await getCollection('posts');
const sortedPosts = posts.sort((a, b) => 
  b.data.date.getTime() - a.data.date.getTime()
);

const pageSize = 10;
const totalPages = Math.ceil(sortedPosts.length / pageSize);
const pagePosts = sortedPosts.slice(0, pageSize);

const page = {
  data: pagePosts,
  currentPage: 1,
  lastPage: totalPages,
  url: {
    prev: null,
    next: totalPages > 1 ? '/page/2/' : null
  }
};
---

<IndexLayout page={page} />
```

### 6.2 Pagination Pages (src/pages/page/[page].astro)

```astro
---
import { getCollection } from 'astro:content';
import IndexLayout from '@layouts/IndexLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  const sortedPosts = posts.sort((a, b) => 
    b.data.date.getTime() - a.data.date.getTime()
  );
  
  const pageSize = 10;
  const totalPages = Math.ceil(sortedPosts.length / pageSize);
  
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    params: { page: String(i + 2) },
    props: {
      posts: sortedPosts.slice((i + 1) * pageSize, (i + 2) * pageSize),
      currentPage: i + 2,
      totalPages
    }
  }));
}

const { posts, currentPage, totalPages } = Astro.props;

const page = {
  data: posts,
  currentPage,
  lastPage: totalPages,
  url: {
    prev: currentPage === 2 ? '/' : `/page/${currentPage - 1}/`,
    next: currentPage < totalPages ? `/page/${currentPage + 1}/` : null
  }
};
---

<IndexLayout page={page} />
```

### 6.3 Post Pages (src/pages/[...slug].astro)

```astro
---
import { getCollection, render } from 'astro:content';
import PostLayout from '@layouts/PostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post }
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<PostLayout post={post}>
  <Content />
</PostLayout>
```

### 6.4 Tags Page (src/pages/tags.astro)

```astro
---
import { getCollection } from 'astro:content';
import PageLayout from '@layouts/PageLayout.astro';

const posts = await getCollection('posts');

// Build tag map
const tagMap = new Map<string, typeof posts>();

posts.forEach((post) => {
  post.data.tags?.forEach((tag) => {
    if (!tagMap.has(tag)) {
      tagMap.set(tag, []);
    }
    tagMap.get(tag)!.push(post);
  });
});

// Sort tags alphabetically
const sortedTags = Array.from(tagMap.entries())
  .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()));

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});
---

<PageLayout title="Tags">
  {sortedTags.map(([tag, tagPosts]) => (
    <section id={slugify(tag)}>
      <h2>{tag}</h2>
      <ul class="posts-list">
        {tagPosts
          .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
          .map((post) => (
            <li>
              <a href={`/${post.slug}/`}>
                {post.data.title}
                <small>{formatDate(post.data.date)}</small>
              </a>
            </li>
          ))}
      </ul>
    </section>
  ))}
</PageLayout>
```

### 6.5 Search Page (src/pages/search.astro)

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import SearchForm from '@components/SearchForm.astro';
---

<BaseLayout title="Search" layout="default">
  <header>
    <h1 class="page-title">
      <label for="search-bar">Search</label>
    </h1>
  </header>
  
  <div class="content">
    <SearchForm />
  </div>
</BaseLayout>
```

### 6.6 RSS Feed (src/pages/feed.xml.ts)

```typescript
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('posts');
  
  const sortedPosts = posts.sort((a, b) => 
    b.data.date.getTime() - a.data.date.getTime()
  );
  
  return rss({
    title: 'Piranha Stories',
    description: 'Short stories to brighten your day.',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: `/${post.slug}/`,
    })),
    customData: '<language>en</language>',
  });
}
```

### 6.7 Keystatic Admin Route (src/pages/keystatic/[...params].astro)

```astro
---
import { Keystatic } from '@keystatic/astro/ui';
---

<Keystatic />
```

### 6.8 Keystatic API Route (src/pages/api/keystatic/[...params].ts)

```typescript
import { makeHandler } from '@keystatic/astro/api';
import keystaticConfig from '../../../../keystatic.config';

export const prerender = false;

export const ALL = makeHandler({ config: keystaticConfig });
```

### URL Structure Comparison

| Current (Eleventy) | Target (Astro) |
|-------------------|----------------|
| `/` | `/` |
| `/page2/` | `/page/2/` |
| `/2018/02/09/judgement-day/` | `/judgement-day/` |
| `/about/` | `/about/` |
| `/tags/` | `/tags/` |
| `/search/` | `/search/` |
| `/feed.xml` | `/feed.xml` |
| `/admin/` | `/keystatic/` |

### Redirects for Old URLs

Create `public/_redirects` for Cloudflare Pages:

```
# Redirect old date-based URLs to new slugs
/2018/02/09/judgement-day/ /judgement-day/ 301
/2017/11/25/the-great-gummy-war/ /the-great-gummy-war/ 301
/2017/11/25/a-date-across-dimensions/ /a-date-across-dimensions/ 301
# ... add all old URLs

# Redirect old pagination
/page2/ /page/2/ 301
/page3/ /page/3/ 301

# Redirect old admin
/admin/ /keystatic/ 301
```

### Testing Criteria

- [ ] Home page displays paginated posts
- [ ] Pagination links work correctly
- [ ] Individual post pages render
- [ ] Tags page shows all tags with linked posts
- [ ] Search page displays form
- [ ] RSS feed validates
- [ ] Keystatic admin accessible at `/keystatic/`
- [ ] Old URLs redirect properly

---

## Phase 7: Keystatic CMS Setup

**Objective:** Configure Keystatic for local development and GitHub production mode.

**Estimated Time:** 1-2 hours

### 7.1 Local Development Mode

Already configured in `keystatic.config.ts` with conditional storage:

```typescript
storage: 
  process.env.NODE_ENV === 'development'
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: 'jasonm4130/piranha-stories',
      },
```

### 7.2 GitHub App Setup

When you first visit `/keystatic` in production, you'll be guided through creating a GitHub App:

1. **Navigate to `/keystatic`** on your production site
2. **Click "Create GitHub App"** - Keystatic will guide you through the OAuth setup
3. **Install the app** on your repository
4. **Copy the environment variables** provided

### 7.3 Environment Variables

Add to Cloudflare Pages dashboard (Settings → Environment Variables):

```
KEYSTATIC_GITHUB_CLIENT_ID=Iv1.xxxxxxxxxx
KEYSTATIC_GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
KEYSTATIC_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=piranha-stories-cms
```

Generate `KEYSTATIC_SECRET` with:
```bash
openssl rand -hex 32
```

### 7.4 Updated wrangler.toml

```toml
name = "piranha-stories"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

pages_build_output_dir = "dist"

[vars]
NODE_VERSION = "20"

# Environment variables are set in Cloudflare dashboard, not here
# KEYSTATIC_GITHUB_CLIENT_ID
# KEYSTATIC_GITHUB_CLIENT_SECRET
# KEYSTATIC_SECRET
# PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
```

### 7.5 Keystatic Collection Features

The configuration supports:

- **Posts Collection:**
  - Title with auto-slug generation
  - Datetime picker with "now" default
  - Optional excerpt field
  - Array of tags
  - Array of categories
  - MDX content editor with rich formatting

- **Pages Collection:**
  - Title with auto-slug
  - Sidebar link toggle
  - MDX content

### 7.6 Advanced Keystatic Features (Optional)

Add image handling:

```typescript
// In keystatic.config.ts
posts: collection({
  // ... existing config
  schema: {
    // ... existing fields
    featuredImage: fields.image({
      label: 'Featured Image',
      directory: 'public/assets/img/posts',
      publicPath: '/assets/img/posts/',
    }),
  },
}),
```

### Testing Criteria

- [ ] Local mode works: `npm run dev` → `/keystatic`
- [ ] Can create/edit posts locally
- [ ] Changes save to `src/content/posts/`
- [ ] GitHub App created successfully
- [ ] Production mode authenticates with GitHub
- [ ] Can edit content in production

---

## Phase 8: Deployment & Migration

**Objective:** Deploy to Cloudflare Pages and perform final migration.

**Estimated Time:** 2-3 hours

### 8.1 Static Assets Migration

```bash
# Copy static assets
mkdir -p public/assets/img
cp -r assets/img/* public/assets/img/

# Copy favicons
cp favicon.ico public/
cp favicon.png public/

# Copy Cloudflare config files
cp _headers public/
cp _redirects public/
```

### 8.2 Directory Structure (Final)

```
piranha-stories/
├── astro.config.mjs
├── keystatic.config.ts
├── package.json
├── tsconfig.json
├── wrangler.toml
├── public/
│   ├── _headers
│   ├── _redirects
│   ├── favicon.ico
│   ├── favicon.png
│   └── assets/
│       └── img/
│           └── logo-min.png
├── src/
│   ├── env.d.ts
│   ├── content/
│   │   ├── config.ts
│   │   ├── posts/
│   │   │   └── *.md
│   │   └── pages/
│   │       └── about.md
│   ├── components/
│   │   └── *.astro
│   ├── layouts/
│   │   └── *.astro
│   ├── pages/
│   │   └── *.astro
│   └── styles/
│       ├── main.scss
│       └── hydeout/
│           └── *.scss
└── dist/                    # Build output
```

### 8.3 Cloudflare Pages Configuration

**Build Settings (in Cloudflare Dashboard):**

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node.js version | 20 |

**Environment Variables:**
```
NODE_VERSION=20
KEYSTATIC_GITHUB_CLIENT_ID=xxx
KEYSTATIC_GITHUB_CLIENT_SECRET=xxx
KEYSTATIC_SECRET=xxx
PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=xxx
```

### 8.4 Migration Strategy

**Option A: In-Place Migration (Recommended for small sites)**

1. Create new branch: `git checkout -b astro-migration`
2. Build Astro project in same repo (replacing Eleventy files)
3. Test thoroughly
4. Merge to main
5. Deploy

**Option B: Parallel Migration**

1. Create Astro project in subdirectory
2. Develop alongside Eleventy
3. When ready, move files to root
4. Remove old Eleventy files

### 8.5 Cleanup Checklist

Files to remove after migration:

```bash
# Eleventy files
rm -rf _layouts/
rm -rf _includes/
rm -rf _posts/
rm -rf _sass/
rm -rf _data/
rm -rf _site/
rm -rf admin/
rm .eleventy.js

# Old config files
rm about.md
rm index.html
rm search.html
rm tags.html
rm 404.html
```

Files to keep:

```
README.md
LICENSE.md
plans/
```

### 8.6 Pre-Launch Checklist

- [ ] All posts migrated and rendering correctly
- [ ] Pagination working on home page
- [ ] Tags page displays all tags
- [ ] Search functionality working
- [ ] RSS feed generating correctly
- [ ] Sidebar navigation complete
- [ ] Mobile responsive design working
- [ ] Keystatic admin functional
- [ ] Old URLs redirecting to new URLs
- [ ] Favicons displaying
- [ ] Meta descriptions correct
- [ ] Disqus comments loading
- [ ] Performance audit (Lighthouse)
- [ ] No broken links (check with tool)

### 8.7 Rollback Plan

If issues arise:

1. Revert Cloudflare Pages to previous deployment
2. Restore from git: `git checkout main -- .`
3. Rebuild: `npm run build`
4. Redeploy

### Testing Criteria

- [ ] Production build succeeds: `npm run build`
- [ ] Preview works: `npm run preview`
- [ ] Cloudflare Pages deployment succeeds
- [ ] All pages accessible
- [ ] Keystatic admin working in production
- [ ] Performance metrics acceptable

---

## Timeline Summary

| Phase | Task | Estimated Time |
|-------|------|---------------|
| 1 | Astro Project Setup | 1-2 hours |
| 2 | Content Migration | 1 hour |
| 3 | Layout Conversion | 2-3 hours |
| 4 | Component Conversion | 2-3 hours |
| 5 | SCSS Integration | 1-2 hours |
| 6 | Pages & Routing | 2-3 hours |
| 7 | Keystatic CMS Setup | 1-2 hours |
| 8 | Deployment & Migration | 2-3 hours |
| **Total** | | **12-19 hours** |

---

## Quick Reference: Liquid → Astro Patterns

| Liquid | Astro |
|--------|-------|
| `{{ variable }}` | `{variable}` |
| `{{ variable \| filter }}` | JS expression or helper |
| `{% if condition %}` | `{condition && (...)}` |
| `{% for item in array %}` | `{array.map(item => (...))}` |
| `{% include "file.html" %}` | `<Component />` |
| `{{ content }}` | `<slot />` |
| `{% assign var = value %}` | `const var = value;` |
| `site.title` | Import from config or hardcode |
| `page.url` | `Astro.url.pathname` |
| `collections.posts` | `await getCollection('posts')` |

---

## Resources

- [Astro Documentation](https://docs.astro.build)
- [Keystatic Documentation](https://keystatic.com/docs)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Keystatic + Astro Guide](https://keystatic.com/docs/installation-astro)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

---

## Appendix: Complete File Inventory

### Files to Create (New)

```
astro.config.mjs
keystatic.config.ts
tsconfig.json
src/env.d.ts
src/content/config.ts
src/layouts/BaseLayout.astro
src/layouts/PostLayout.astro
src/layouts/PageLayout.astro
src/layouts/IndexLayout.astro
src/components/Head.astro
src/components/Sidebar.astro
src/components/PostMeta.astro
src/components/PostTags.astro
src/components/Pagination.astro
src/components/RelatedPosts.astro
src/components/Comments.astro
src/components/SearchForm.astro
src/components/TagsList.astro
src/components/sidebar/NavLinks.astro
src/components/sidebar/IconLinks.astro
src/components/icons/BackArrow.astro
src/components/icons/Feed.astro
src/components/icons/GitHub.astro
src/components/icons/Message.astro
src/components/icons/Search.astro
src/components/icons/Tags.astro
src/pages/index.astro
src/pages/about.astro
src/pages/tags.astro
src/pages/search.astro
src/pages/404.astro
src/pages/feed.xml.ts
src/pages/page/[page].astro
src/pages/[...slug].astro
src/pages/keystatic/[...params].astro
src/pages/api/keystatic/[...params].ts
```

### Files to Migrate (Copy & Modify)

```
_posts/*.md → src/content/posts/*.md
about.md → src/content/pages/about.md
_sass/hydeout/*.scss → src/styles/hydeout/*.scss
assets/img/* → public/assets/img/*
_includes/svg/*.svg → src/components/icons/*.astro
```

### Files to Update

```
package.json (new dependencies)
wrangler.toml (new config)
public/_redirects (URL redirects)
```

### Files to Remove (After Migration)

```
.eleventy.js
_layouts/
_includes/
_posts/
_sass/
_data/
_site/
admin/
index.html
search.html
tags.html
404.html
about.md
assets/css/main.scss
assets/css/prism.css
```
