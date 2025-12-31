# Code Generation Guidelines

## When Creating New Posts

Create a new `.md` file in `src/content/posts/` with this structure:

```markdown
---
title: Your Post Title
date: YYYY-MM-DD
tags: []
categories: []
excerpt: A brief description of the post
---

Your post content here...
```

The filename should be kebab-case matching the title (e.g., `my-new-post.md`).

## When Creating New Pages

Create a new `.md` file in `src/content/pages/`:

```markdown
---
title: Page Title
sidebarLink: false
---

Page content here...
```

Set `sidebarLink: true` to show the page in the sidebar navigation.

## When Modifying Styles

1. Variables are in `src/styles/hydeout/_variables.scss`
2. Each partial must include `@use "variables" as *;` at the top
3. Use modern Sass syntax:
   - `color.adjust($color, $lightness: 7%)` instead of `lighten($color, 7%)`
   - `@use` instead of `@import`

## When Adding New Routes

Create a new `.astro` file in `src/pages/`. For dynamic routes, use bracket syntax:
- `[slug].astro` for single parameter
- `[...slug].astro` for catch-all

## When Modifying Keystatic Config

The config is in `keystatic.config.ts`. Key points:
- Uses `local` storage in development, `github` storage in production
- Content uses `extension: 'md'` for standard markdown files
- Collections define the CMS editing interface

## Testing Changes

1. Run `npm run dev` to start the dev server
2. Check http://localhost:4321 for the site
3. Check http://localhost:4321/keystatic for the CMS
4. Run `npm run build` to verify production build works

## Common Issues

### Empty content on homepage
- Check that content files use `.md` extension (not `.mdoc`)
- Verify `src/content/config.ts` schema matches frontmatter

### Keystatic not loading posts
- Ensure `extension: 'md'` is set in keystatic.config.ts
- Check that paths match: `src/content/posts/*`

### SCSS deprecation warnings
- Replace `@import` with `@use`
- Replace `lighten()`/`darken()` with `color.adjust()`
