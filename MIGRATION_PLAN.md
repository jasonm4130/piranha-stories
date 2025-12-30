# Piranha Stories: Jekyll to Modern SSG Migration Plan

## Executive Summary

This document outlines a comprehensive migration strategy for moving **piranhastories.com** from Jekyll 3.9 (hosted on Netlify) to a modern static site generator optimized for Cloudflare Pages.

**Recommendation:** Migrate to **Eleventy (11ty)** as the primary SSG, with Decap CMS for content management.

---

## 1. Current Project Analysis

### Technology Stack
| Component | Current Implementation |
|-----------|----------------------|
| **SSG** | Jekyll 3.9 |
| **Theme** | Hydeout (Hyde derivative) |
| **Styling** | SCSS (12 partials in `_sass/hydeout/`) |
| **Markdown** | Kramdown with GFM parser |
| **Syntax Highlighting** | Rouge |
| **CMS** | Netlify CMS (deprecated) with git-gateway |
| **Comments** | Disqus (`piranhastories-com`) |
| **Analytics** | Google Analytics Universal (UA-109846768-1) |
| **Hosting** | Netlify |
| **Domain** | piranhastories.com |

### Content Inventory
- **12 blog posts** (short stories, 2017-2018)
- **Simple front matter**: `layout`, `title`, `date` fields only
- **Permalink structure**: `pretty` → `/2017/11/17/Hunt-for-the-Dragon-Emperor/`
- **Pagination**: 10 posts per page
- **Static pages**: About, Search (Google redirect), Subscribe, Tags

### Current Features Requiring Migration
1. Sidebar navigation with logo (`/assets/img/logo-min.png`)
2. Tag system with tag index page
3. Pagination (jekyll-paginate plugin)
4. RSS feed (jekyll-feed plugin)
5. GitHub Gist embeds (jekyll-gist plugin)
6. Related posts section
7. Disqus comments integration
8. Google Analytics tracking

---

## 2. SSG Evaluation for Cloudflare Pages

### Comparison Matrix

| Criteria | **Eleventy (11ty)** | **Astro** | **Hugo** | **Next.js (Static)** |
|----------|---------------------|-----------|----------|---------------------|
| **Jekyll Compatibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Build Speed** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Cloudflare Pages Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Template Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Markdown Handling** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Future Maintainability** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### Recommendation: Eleventy (11ty)

**Why Eleventy?**

1. **Near-zero migration friction**: Eleventy supports Liquid templates (Jekyll's templating language) out of the box
2. **Directory structure compatibility**: `_includes`, `_layouts`, `_data` conventions match Jekyll
3. **Markdown with YAML front matter**: Works identically to Jekyll
4. **No framework lock-in**: Pure JavaScript, no React/Vue required
5. **Excellent Cloudflare Pages support**: Official framework preset available
6. **Lightweight**: No client-side JavaScript by default (matches Jekyll's output)
7. **Active community**: Well-maintained with regular updates
8. **SCSS support**: Via official plugin or build tool integration

**Cloudflare Pages Build Configuration:**
```
Build command: npx @11ty/eleventy
Build output directory: _site
```

---

## 3. Cloudflare Pages Specifics

### Build Configuration
```yaml
# wrangler.toml (optional, for advanced config)
name = "piranha-stories"
compatibility_date = "2024-01-01"

[site]
bucket = "./_site"
```

### Key Differences from Netlify

| Feature | Netlify | Cloudflare Pages |
|---------|---------|------------------|
| **Identity/Auth** | Built-in Netlify Identity | None (use external OAuth) |
| **Git Gateway** | Native support | Not available |
| **Redirects** | `_redirects` or `netlify.toml` | `_redirects` file (2,100 limit) |
| **Headers** | `_headers` file | `_headers` file ✅ |
| **Functions** | Netlify Functions | Pages Functions (Workers) |
| **Build Minutes** | 300/month (free) | 500/month (free) |
| **Bandwidth** | 100GB/month (free) | Unlimited (free) |
| **Preview Deploys** | Yes | Yes ✅ |

### Redirects Configuration
Create `public/_redirects` (or in build output):
```
# Preserve old feed URLs if needed
/feed.xml /feed.xml 200
/rss.xml /feed.xml 301

# Handle any legacy paths
/blog/* /:splat 301
```

### Headers Configuration
Create `public/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

### Analytics Options

| Option | Pros | Cons |
|--------|------|------|
| **Cloudflare Web Analytics** | Free, privacy-focused, no cookies, one-click setup for Pages | Less detailed than GA4 |
| **GA4** | Full-featured, familiar | Privacy concerns, cookie banners needed |
| **Plausible/Fathom** | Privacy-focused, detailed | Paid services |

**Recommendation:** Start with **Cloudflare Web Analytics** (free, built-in). Enable via:
1. Cloudflare Dashboard → Workers & Pages → Your Project → Metrics → Enable Web Analytics

The current UA-109846768-1 (Universal Analytics) is deprecated and must be migrated regardless.

---

## 4. CMS Replacement Strategy

### Current Setup Issues
- **Netlify CMS** is deprecated (rebranded to Decap CMS)
- **git-gateway** backend requires Netlify Identity (not available on Cloudflare)

### Recommended: Decap CMS with GitHub OAuth Proxy

**Architecture:**
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Decap CMS     │────▶│ Cloudflare Worker│────▶│   GitHub    │
│ (/admin panel)  │     │ (OAuth Proxy)    │     │    API      │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

**Implementation Steps:**

1. **Deploy OAuth Proxy** (Cloudflare Worker):
   - Use template: https://github.com/sterlingwes/decap-proxy
   - Create GitHub OAuth App at: https://github.com/settings/developers
   - Deploy to `auth.piranhastories.com` or similar subdomain

2. **Update CMS Config** (`admin/config.yml`):
```yaml
backend:
  name: github
  repo: your-username/piranha-stories
  branch: main
  base_url: https://auth.piranhastories.com  # Your OAuth proxy
  auth_endpoint: /auth

media_folder: "assets/img"
public_folder: "/assets/img"

collections:
  - name: "posts"
    label: "Posts"
    folder: "src/posts"  # Updated path for Eleventy
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - {label: "Layout", name: "layout", widget: "hidden", default: "post.njk"}
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Publish Date", name: "date", widget: "datetime"}
      - {label: "Tags", name: "tags", widget: "list", required: false}
      - {label: "Body", name: "body", widget: "markdown"}
```

### Alternative CMS Options

| CMS | Setup Complexity | Best For |
|-----|------------------|----------|
| **Decap CMS + OAuth Worker** | Medium | Full feature parity with current setup |
| **GitHub.dev / Prose.io** | None | Technical users editing directly |
| **Tina CMS** | Medium | Visual editing, Git-based |
| **Forestry.io (Tina Cloud)** | Low | Managed Git CMS |
| **No CMS** | None | Direct Git commits only |

---

## 5. Content Migration Plan

### Markdown Posts
**Status: ✅ Minimal changes required**

Current front matter:
```yaml
---
layout: post
title: Hunt for the Dragon Emperor
date: 2017-11-17T00:00:00.000Z
---
```

Eleventy front matter (updated):
```yaml
---
layout: post.njk
title: Hunt for the Dragon Emperor
date: 2017-11-17
tags: 
  - posts
---
```

### Migration Script
```javascript
// scripts/migrate-posts.js
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const postsDir = './_posts';
const outputDir = './src/posts';

fs.readdirSync(postsDir).forEach(file => {
  const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
  const { data, content: body } = matter(content);
  
  // Transform front matter
  const newData = {
    layout: 'post.njk',
    title: data.title,
    date: data.date || file.slice(0, 10),
    tags: ['posts', ...(data.tags || [])]
  };
  
  const newContent = matter.stringify(body, newData);
  fs.writeFileSync(path.join(outputDir, file), newContent);
});
```

### URL Preservation
**Critical:** Maintain existing URLs for SEO

Eleventy permalink configuration (in `src/posts/posts.json`):
```json
{
  "layout": "post.njk",
  "tags": "posts",
  "permalink": "/{{ page.date | date: '%Y/%m/%d' }}/{{ page.fileSlug }}/"
}
```

This preserves: `/2017/11/17/Hunt-for-the-Dragon-Emperor/`

---

## 6. Styling Migration

### Current SCSS Structure
```
_sass/
├── hydeout.scss          # Main entry point
└── hydeout/
    ├── _variables.scss   # Colors, fonts, spacing
    ├── _base.scss        # Reset, body styles
    ├── _type.scss        # Typography
    ├── _syntax.scss      # Code highlighting
    ├── _code.scss        # Code blocks
    ├── _layout.scss      # Sidebar, flexbox layout
    ├── _masthead.scss    # Header styles
    ├── _posts.scss       # Post styling
    ├── _pagination.scss  # Pagination
    ├── _message.scss     # Alert boxes
    ├── _search.scss      # Search form
    └── _tags.scss        # Tag styling
```

### Migration Options

#### Option A: Keep SCSS (Recommended for parity)
Install `@11ty/eleventy-sass`:
```bash
npm install @11ty/eleventy-sass
```

Configure in `.eleventy.js`:
```javascript
const eleventySass = require("@11ty/eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass);
  return {
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
```

#### Option B: Modern CSS (Future-proof)
Convert SCSS to CSS with:
- CSS Custom Properties (variables)
- Native CSS nesting (now widely supported)
- Logical properties for RTL support

Example variable conversion:
```css
/* From SCSS */
$sidebar-bg-color: #202020;

/* To CSS Custom Properties */
:root {
  --sidebar-bg-color: #202020;
  --gray-1: #f9f9f9;
  --gray-2: #e5e5e5;
  --gray-3: #ccc;
  --gray-4: #767676;
  --gray-5: #515151;
  --gray-6: #313131;
  --blue: #268bd2;
  --sidebar-width: 18rem;
  --large-breakpoint: 49rem;
  --section-spacing: 2rem;
}
```

### Theme Preservation Checklist
- [ ] Dark sidebar (#202020 gradient background)
- [ ] Abril Fatface font for site title
- [ ] System font stack for body text
- [ ] Fixed sidebar on desktop (sticky)
- [ ] Mobile-first responsive breakpoint at 49rem
- [ ] Post excerpt with "More..." link
- [ ] Tags display and linking
- [ ] Pagination styling

---

## 7. Features Requiring Special Attention

### 1. Pagination
**Jekyll:** `jekyll-paginate` plugin  
**Eleventy:** Built-in pagination

```javascript
// src/index.njk
---
layout: base.njk
pagination:
  data: collections.posts
  size: 10
  reverse: true
  alias: posts
permalink: "{% if pagination.pageNumber > 0 %}/page{{ pagination.pageNumber + 1 }}/{% else %}/{% endif %}"
---

{% for post in posts %}
  <article>
    <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
    {{ post.templateContent | excerpt }}
  </article>
{% endfor %}
```

### 2. RSS Feed
**Solution:** `@11ty/eleventy-plugin-rss`

```bash
npm install @11ty/eleventy-plugin-rss
```

### 3. Syntax Highlighting
**Solution:** `@11ty/eleventy-plugin-syntaxhighlight` (uses Prism.js)

```bash
npm install @11ty/eleventy-plugin-syntaxhighlight
```

Note: May need to adjust CSS if using Rouge-specific classes.

### 4. Related Posts
**Jekyll:** `site.related_posts` (basic, based on tags)  
**Eleventy:** Custom filter needed

```javascript
// .eleventy.js
eleventyConfig.addFilter("relatedPosts", (collection, tags, currentUrl) => {
  return collection
    .filter(post => {
      return post.url !== currentUrl && 
             post.data.tags?.some(tag => tags?.includes(tag));
    })
    .slice(0, 3);
});
```

### 5. Disqus Comments
**No changes needed** - just ensure the same template include:

```html
<!-- src/_includes/comments.njk -->
{% if not hideComments %}
<div id="disqus_thread"></div>
<script>
  var disqus_config = function () {
    this.page.url = '{{ page.url | url | absoluteUrl(site.url) }}';
    this.page.identifier = '{{ page.url }}';
  };
  (function() {
    var d = document, s = d.createElement('script');
    s.src = 'https://piranhastories-com.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  })();
</script>
{% endif %}
```

### 6. Search
Current implementation redirects to Google site search. Consider:
- Keep as-is (simplest)
- Add client-side search with [Pagefind](https://pagefind.app/) (recommended)
- Use Algolia DocSearch (if eligible)

---

## 8. Potential Issues and Breaking Changes

### High Risk
| Issue | Impact | Mitigation |
|-------|--------|------------|
| **URL changes** | SEO/bookmarks broken | Maintain exact permalink structure |
| **CMS auth failure** | Cannot edit content | Test OAuth proxy thoroughly before cutover |
| **Missing template filters** | Build failures | Audit all Liquid filters used |

### Medium Risk
| Issue | Impact | Mitigation |
|-------|--------|------------|
| **Syntax highlighting CSS** | Code blocks look different | Update CSS for Prism.js classes |
| **RSS feed URL change** | Subscribers lose updates | Add redirect if URL changes |
| **Date handling** | Wrong dates displayed | Use consistent ISO format |

### Low Risk
| Issue | Impact | Mitigation |
|-------|--------|------------|
| **Disqus thread mismatch** | Comments on wrong posts | Maintain same page identifiers |
| **Google Analytics gap** | Data discontinuity | Run both GA4 and CF Analytics briefly |

---

## 9. Recommended Phased Approach

### Phase 1: Setup and Content Migration (Week 1)
- [ ] Initialize Eleventy project structure
- [ ] Copy and migrate all 12 posts
- [ ] Convert layouts from Liquid to Nunjucks (or keep Liquid)
- [ ] Verify all URLs match existing structure
- [ ] Set up basic build pipeline

### Phase 2: Styling and Features (Week 2)
- [ ] Migrate SCSS to new build process
- [ ] Implement pagination
- [ ] Add RSS feed plugin
- [ ] Add syntax highlighting
- [ ] Port sidebar, navigation, footer
- [ ] Verify responsive design

### Phase 3: CMS and Authentication (Week 3)
- [ ] Create GitHub OAuth App
- [ ] Deploy Cloudflare Worker OAuth proxy
- [ ] Configure Decap CMS
- [ ] Test content creation/editing workflow
- [ ] Document CMS usage

### Phase 4: Testing and Deployment (Week 4)
- [ ] Deploy to Cloudflare Pages (staging)
- [ ] Compare all pages with current site
- [ ] Test all links and navigation
- [ ] Verify Disqus comments load
- [ ] Performance testing (Lighthouse)
- [ ] Enable Cloudflare Web Analytics

### Phase 5: Cutover (Week 5)
- [ ] Update DNS to point to Cloudflare Pages
- [ ] Verify SSL/TLS configuration
- [ ] Set up `_redirects` for any needed redirects
- [ ] Monitor for errors
- [ ] Deprecate Netlify site (keep as backup initially)

---

## 10. New Project Structure

```
piranha-stories/
├── .eleventy.js              # Eleventy config
├── package.json
├── src/
│   ├── _data/
│   │   └── site.json         # Site metadata
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk
│   │   │   ├── post.njk
│   │   │   └── page.njk
│   │   ├── partials/
│   │   │   ├── sidebar.njk
│   │   │   ├── comments.njk
│   │   │   ├── pagination.njk
│   │   │   └── post-meta.njk
│   │   └── head.njk
│   ├── posts/                # Blog posts (migrated from _posts)
│   │   └── *.md
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.scss
│   │   └── img/
│   │       └── logo-min.png
│   ├── admin/
│   │   ├── index.html
│   │   └── config.yml
│   ├── index.njk
│   ├── about.md
│   ├── tags.njk
│   └── feed.njk
├── public/
│   ├── _redirects
│   └── _headers
└── _site/                    # Build output
```

---

## 11. Quick Start Commands

```bash
# 1. Create new Eleventy project
mkdir piranha-stories-new && cd piranha-stories-new
npm init -y
npm install @11ty/eleventy @11ty/eleventy-plugin-rss @11ty/eleventy-plugin-syntaxhighlight

# 2. Optional: Add SCSS support
npm install @11ty/eleventy-sass

# 3. Development server
npx @11ty/eleventy --serve

# 4. Production build
npx @11ty/eleventy

# 5. Deploy to Cloudflare Pages
# Connect GitHub repo in Cloudflare dashboard
# Build command: npx @11ty/eleventy
# Output directory: _site
```

---

## 12. Success Criteria

Before considering migration complete:

- [ ] All 12 posts accessible at original URLs
- [ ] Pagination works identically (10 per page)
- [ ] RSS feed validates and contains all posts
- [ ] Tags page lists all tags with counts
- [ ] Disqus comments load on all posts
- [ ] CMS allows creating/editing posts
- [ ] Mobile responsive layout matches original
- [ ] Lighthouse performance score ≥ 90
- [ ] No console errors in browser
- [ ] Cloudflare Web Analytics receiving data

---

## Appendix A: Dependency Comparison

| Current (Jekyll) | New (Eleventy) |
|-----------------|----------------|
| `jekyll ~> 3.9` | `@11ty/eleventy` |
| `jekyll-feed` | `@11ty/eleventy-plugin-rss` |
| `jekyll-paginate` | Built-in pagination |
| `jekyll-gist` | Custom shortcode or markdown |
| `kramdown` | `markdown-it` (default) |
| `rouge` | Prism.js via plugin |
| Ruby + Bundler | Node.js + npm |

## Appendix B: Cloudflare Pages Build Settings

| Setting | Value |
|---------|-------|
| **Framework preset** | Eleventy |
| **Build command** | `npx @11ty/eleventy` |
| **Build output directory** | `_site` |
| **Root directory** | `/` |
| **Node.js version** | 18.x or 20.x |

## Appendix C: OAuth Proxy Environment Variables

For the Cloudflare Worker OAuth proxy:

```
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
REDIRECT_URL=https://piranhastories.com/admin/
```

---

*Document generated: December 30, 2025*  
*Last updated: December 30, 2025*
