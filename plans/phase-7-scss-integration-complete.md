# Phase 7: SCSS Integration - Complete ✅

**Date:** December 30, 2025

## Summary

Integrated SCSS compilation directly into Eleventy with CSS minification and PurgeCSS for unused CSS removal.

## Implementation Approach

Used Eleventy 3.x native `addTemplateFormats` and `addExtension` APIs to add SCSS as a first-class template format, with PostCSS for optimization.

## Changes Made

### 1. `.eleventy.js` - SCSS Compilation Integration

Added SCSS as a custom template format with:
- **sass** - Compiles SCSS to CSS
- **postcss** - Post-processing pipeline
- **purgecss** - Removes unused CSS (production only)
- **cssnano** - Minifies CSS (production only)

Key features:
- Automatic partial detection (skips files starting with `_`)
- Skips files in `_sass/` directory
- Production mode detected via `NODE_ENV` or `ELEVENTY_RUN_MODE`
- Safelists for syntax highlighting classes

### 2. `package.json` - Simplified Scripts

**Before:**
```json
"scripts": {
  "dev": "npm-run-all --parallel dev:*",
  "dev:eleventy": "eleventy --serve",
  "dev:sass": "sass --watch ...",
  "build": "npm-run-all build:sass build:eleventy",
  "build:sass": "sass ... --style=compressed",
  "build:eleventy": "eleventy"
}
```

**After:**
```json
"scripts": {
  "dev": "eleventy --serve",
  "build": "NODE_ENV=production eleventy",
  "clean": "rm -rf _site",
  "debug": "DEBUG=Eleventy* eleventy"
}
```

### 3. Files Renamed

- `assets/css/main-eleventy.scss` → `assets/css/main.scss`

### 4. Dependencies

**Added:**
- `postcss` - CSS processing pipeline
- `cssnano` - CSS minification
- `@fullhuman/postcss-purgecss` - Unused CSS removal

**Removed:**
- `npm-run-all` - No longer needed (single eleventy command)

## Results

### CSS Size Comparison

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| CSS (compressed) | 10,276 bytes | 6,980 bytes | **3,296 bytes (32%)** |

### Build Simplification

| Metric | Before | After |
|--------|--------|-------|
| Build commands | 2 (parallel) | 1 |
| Dev commands | 2 (parallel) | 1 |
| Package dependencies | 5 | 7 (net +2) |
| npm scripts | 6 | 4 |

### Features

- ✅ Single `npm run build` command
- ✅ Single `npm run dev` command
- ✅ CSS minified in production
- ✅ Unused CSS purged (32% reduction)
- ✅ SCSS hot reload in dev mode
- ✅ Source SCSS files watched

## PurgeCSS Configuration

```javascript
safelist: {
  standard: [
    /^hljs/,        // Syntax highlighting
    /^prism/,       // Prism syntax highlighting
    /^token/,       // Prism tokens
    /^language-/,   // Code language classes
    /^code-/,       // Code blocks
    /^line-/,       // Line numbers
    "sr-only",      // Screen reader only
    "visually-hidden"
  ],
  deep: [/^sidebar/, /^container/, /^content/]
}
```

## Build Output Verification

```
[11ty] Writing ./_site/assets/css/main.css from ./assets/css/main.scss
[11ty] Copied 9 Wrote 22 files in 0.96 seconds (v3.1.2)
```

## Known Issues

1. **Sass deprecation warnings** - The SCSS uses deprecated `@import` syntax and `lighten()`/`darken()` functions. These still work but will need updating before Dart Sass 3.0.

## Next Steps

Potential future optimizations:
1. Migrate SCSS from `@import` to `@use` syntax
2. Update deprecated color functions
3. Consider inlining critical CSS
4. Add CSS source maps for dev mode
