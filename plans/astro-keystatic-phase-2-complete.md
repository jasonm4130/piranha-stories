## Phase 2 Complete: Content Migration

Migrated all 13 posts from Eleventy's `_posts/` directory to Astro content collections, along with the about page. All frontmatter was normalized to match the new schema.

**Files created/changed:**

- src/content/config.ts (content collection schemas)
- src/content/posts/hunt-for-the-dragon-emperor.md
- src/content/posts/the-recorder.md
- src/content/posts/society-for-the-conservation-of-sentient-beings.md
- src/content/posts/the-ai-disappear.md
- src/content/posts/the-snake-charmer.md
- src/content/posts/number-238993.md
- src/content/posts/a-willing-soul.md
- src/content/posts/the-boogey-man-escapes.md
- src/content/posts/the-eldritch-horror.md
- src/content/posts/in-the-garden-with-lucy.md
- src/content/posts/a-date-across-dimensions.md
- src/content/posts/the-great-gummy-war.md
- src/content/posts/judgement-day.md
- src/content/pages/about.md

**Schema changes:**

- Posts: title, date, excerpt (optional), tags, categories
- Pages: title, sidebarLink (optional)

**Tests/Verifications:**

- `npx astro check` - 0 errors, 0 warnings, 0 hints
- All 13 posts migrated successfully
- Frontmatter normalized (removed `layout`, added empty arrays)
- Filenames converted to lowercase kebab-case

**Review Status:** APPROVED

**Git Commit Message:**
```
feat: Migrate content to Astro collections

- Create content collection schemas for posts and pages
- Migrate 13 posts from _posts/ to src/content/posts/
- Normalize frontmatter (remove layout, add tags/categories arrays)
- Convert filenames to lowercase kebab-case without date prefix
- Migrate about page to src/content/pages/
```
