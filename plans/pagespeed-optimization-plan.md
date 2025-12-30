# PageSpeed Insights Optimization Plan

**Created:** December 30, 2025  
**Site:** piranhastories.com  
**Stack:** Eleventy 3.x, SCSS (Hydeout theme), Cloudflare Pages

## Current Scores (Mobile)

| Metric | Current | Target |
|--------|---------|--------|
| Performance | 87 | 95+ |
| Accessibility | 79 | 95+ |
| Best Practices | 96 | 100 |
| SEO | 83 | 100 |

### Core Web Vitals
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| FCP | 2.8s | < 1.8s | ⚠️ Needs Work |
| LCP | 3.2s | < 2.5s | ❌ Poor |
| TBT | 110ms | < 200ms | ✅ Good |
| CLS | 0.029 | < 0.1 | ✅ Good |
| Speed Index | 3.1s | < 3.4s | ⚠️ Needs Work |

---

## Phase 1: Quick Wins (High Impact, Low Effort)

**Estimated Impact: +8-12 Performance, +16 Accessibility, +17 SEO**

### 1.1 Add Meta Description (SEO +10)
**Issue:** Document does not have a meta description  
**Effort:** 5 minutes  
**Files to modify:**
- `_includes/head.html`
- `_data/site.json`

**Implementation:**
```html
<!-- Add to head.html after title -->
<meta name="description" content="{% if description %}{{ description }}{% else %}{{ site.tagline }}{% endif %}" />
```

Add to `site.json`:
```json
"description": "A collection of short stories by Brian_AP. Science fiction, fantasy, and creative writing to brighten your day."
```

---

### 1.2 Fix Viewport Meta (Accessibility +5)
**Issue:** `maximum-scale=1` prevents user zooming  
**Effort:** 2 minutes  
**File:** `_includes/head.html`

**Change from:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
```

**Change to:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

---

### 1.3 Add Alt Attributes to Images (Accessibility +5, SEO +5)
**Issue:** Image elements do not have `alt` attributes  
**Effort:** 10 minutes  
**Files to modify:**
- `_includes/sidebar.html` (logo image)

**Change from:**
```html
<img class="logo" src="/assets/img/logo-min.png">
```

**Change to:**
```html
<img class="logo" src="/assets/img/logo-min.png" alt="Piranha Stories logo" width="280" height="280">
```

---

### 1.4 Add Width/Height to Images (Performance +2)
**Issue:** Image elements do not have explicit width and height  
**Effort:** 5 minutes  
**File:** `_includes/sidebar.html`

Check actual image dimensions and add `width` and `height` attributes to prevent CLS.

---

### 1.5 Optimize Font Loading (Performance +3, FCP -0.5s)
**Issue:** Font blocks rendering, no preconnect  
**Effort:** 10 minutes  
**Files to modify:**
- `_includes/head.html`
- `_includes/font-includes.html`

**Add preconnect before fonts:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

**Update font-includes.html:**
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap" />
```

The `&display=swap` parameter adds `font-display: swap` to prevent FOIT (Flash of Invisible Text).

---

### 1.6 Remove Netlify Identity Widget (Performance +3)
**Issue:** Unused JavaScript blocking rendering (46 KiB savings)  
**Effort:** 2 minutes  
**File:** `_includes/custom-head.html`

This script is no longer needed since migrating from Netlify to Cloudflare:
```html
<!-- Remove this line -->
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
```

Replace with:
```html
<!-- Additional head bits without overriding original head -->
```

---

### 1.7 Enhance Security Headers (Best Practices +4)
**Issue:** Missing HSTS, COOP, CSP headers  
**Effort:** 10 minutes  
**File:** `_headers`

**Add/update headers:**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: credentialless
  Cross-Origin-Resource-Policy: same-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://downloads.mailchimp.com https://*.disqus.com https://*.disquscdn.com https://identity.netlify.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.disqus.com https://*.disquscdn.com; frame-src https://disqus.com https://*.disqus.com; connect-src 'self' https://*.disqus.com
```

---

## Phase 2: Medium Effort Improvements

**Estimated Impact: +5-8 Performance**

### 2.1 Defer/Async Mailchimp Script (Performance +4)
**Issue:** Render-blocking JavaScript  
**Effort:** 20 minutes  
**File:** `_includes/custom-foot.html`

**Option A - Defer Loading:**
```html
<script>
  // Load Mailchimp after page is interactive
  window.addEventListener('load', function() {
    setTimeout(function() {
      var script = document.createElement('script');
      script.src = '//downloads.mailchimp.com/js/signup-forms/popup/embed.js';
      script.setAttribute('data-dojo-config', 'usePlainJson: true, isDebug: false');
      script.onload = function() {
        require(["mojo/signup-forms/Loader"], function(L) {
          L.start({
            "baseUrl": "mc.us17.list-manage.com",
            "uuid": "0b08c7167ea4a31762e035ca0",
            "lid": "4d3091b5c5"
          });
        });
      };
      document.body.appendChild(script);
    }, 3000); // Delay 3 seconds after load
  });
</script>
```

**Option B - Remove entirely** if email signups are low priority.

---

### 2.2 Preload Critical CSS (Performance +3)
**Issue:** Render-blocking CSS  
**Effort:** 15 minutes  
**File:** `_includes/head.html`

**Current:**
```html
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/main.css" />
```

**Optimized with preload:**
```html
<link rel="preload" href="{{ site.baseurl }}/assets/css/main.css" as="style">
<link rel="stylesheet" href="{{ site.baseurl }}/assets/css/main.css" />
```

---

### 2.3 Inline Critical CSS (Performance +5)
**Issue:** Render-blocking CSS (1,440ms savings potential)  
**Effort:** 1-2 hours  
**Files to modify:**
- `_includes/head.html`
- `eleventy.config.js` (new)
- `package.json`

**Install critical CSS generator:**
```bash
npm install --save-dev @11ty/eleventy-plugin-bundle
```

**Create above-the-fold critical CSS inline:**
Extract critical CSS for sidebar and initial content, then inline it:

```html
<style>
  /* Critical CSS - Above the fold */
  *{box-sizing:border-box}html,body{margin:0;padding:0}
  body{color:hsla(0,0%,100%,.75);background-color:#202020;display:flex;flex-direction:column;min-width:100vw;min-height:100vh}
  #sidebar{flex:0 0 auto;padding:2rem}
  /* ... rest of critical styles */
</style>
<link rel="stylesheet" href="/assets/css/main.css" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="/assets/css/main.css"></noscript>
```

---

### 2.4 Add Cache Headers for Fonts (Performance +2)
**Issue:** Use efficient cache lifetimes  
**Effort:** 5 minutes  
**File:** `_headers`

Google Fonts are already cached by their CDN, but ensure CSS has proper cache:
```
/assets/css/*
  Cache-Control: public, max-age=31536000, immutable
```

Already present, but consider adding:
```
/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

---

### 2.5 Lazy Load Prism.css (Performance +1)
**Issue:** Unused CSS on pages without code blocks  
**Effort:** 30 minutes  
**Files:** `_includes/head.html`, `_layouts/post.html`

Only load Prism.css on posts with code blocks:
```html
{% if content contains '<pre' or content contains '<code' %}
<link rel="stylesheet" href="/assets/css/prism.css" />
{% endif %}
```

---

## Phase 3: Larger Refactoring Tasks

**Estimated Impact: +3-5 Performance, Long-term benefits**

### 3.1 PurgeCSS Integration (21 KiB savings)
**Issue:** Reduce unused CSS  
**Effort:** 2-3 hours  
**Files to modify:**
- `package.json`
- New: `postcss.config.js`

**Install dependencies:**
```bash
npm install --save-dev purgecss postcss postcss-cli
```

**Create postcss.config.js:**
```javascript
module.exports = {
  plugins: [
    require('@fullhuman/postcss-purgecss')({
      content: ['./_site/**/*.html'],
      safelist: ['highlight', /^hljs/, /^language-/],
    })
  ]
}
```

**Update package.json scripts:**
```json
{
  "scripts": {
    "build:css": "sass assets/css/main-eleventy.scss:_site/assets/css/main.css --style=compressed --load-path=_sass && postcss _site/assets/css/main.css -o _site/assets/css/main.css"
  }
}
```

---

### 3.2 Self-Host Google Font (Performance +2)
**Issue:** External font request adds latency  
**Effort:** 1 hour  
**Files to modify:**
- `assets/fonts/` (new directory)
- `_includes/font-includes.html`
- `_sass/hydeout/_layout.scss`

**Steps:**
1. Download Abril Fatface from Google Fonts or use google-webfonts-helper
2. Add to `assets/fonts/abril-fatface-v23-latin-regular.woff2`
3. Update CSS to use local font:

```scss
@font-face {
  font-family: 'Abril Fatface';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/assets/fonts/abril-fatface-v23-latin-regular.woff2') format('woff2');
}
```

4. Remove Google Fonts link from `font-includes.html`

---

### 3.3 Implement Service Worker (Performance, UX)
**Issue:** No offline support, no prefetching  
**Effort:** 3-4 hours  
**New files:**
- `sw.js`
- Update `_includes/custom-foot.html`

**Benefits:**
- Cache static assets
- Enable offline reading
- Prefetch linked pages

---

### 3.4 Add Trusted Types (Best Practices)
**Issue:** No Trusted Types for DOM XSS  
**Effort:** 2-3 hours  
**Complex:** Requires refactoring inline scripts

This is a lower priority as it requires significant refactoring of Disqus and Mailchimp integrations.

---

### 3.5 Fix Color Contrast Issues (Accessibility +5)
**Issue:** Background/foreground colors insufficient contrast ratio  
**Effort:** 1-2 hours  
**Files:** `_sass/hydeout/_variables.scss`, `_sass/hydeout/_layout.scss`

**Identify problematic colors:**
- Sidebar text: `hsla(0,0%,100%,.75)` on `#202020` 
- Body muted text: `$gray-4: #767676` on white

**Fix sidebar text contrast:**
```scss
// In _layout.scss, change:
color: hsla(0,0%,100%,.75);
// To:
color: hsla(0,0%,100%,.87);  // Or #fff for maximum contrast
```

---

## Implementation Priority

### Week 1: Quick Wins (Phase 1)
| Task | Time | Impact |
|------|------|--------|
| 1.1 Add meta description | 5 min | SEO +10 |
| 1.2 Fix viewport meta | 2 min | A11y +5 |
| 1.3 Add alt attributes | 10 min | A11y +5, SEO +5 |
| 1.4 Add image dimensions | 5 min | Perf +2 |
| 1.5 Optimize font loading | 10 min | Perf +3 |
| 1.6 Remove Netlify widget | 2 min | Perf +3 |
| 1.7 Enhance security headers | 10 min | BP +4 |

**Total Phase 1: ~45 minutes**

### Week 2: Medium Effort (Phase 2)
| Task | Time | Impact |
|------|------|--------|
| 2.1 Defer Mailchimp | 20 min | Perf +4 |
| 2.2 Preload CSS | 15 min | Perf +3 |
| 2.3 Inline critical CSS | 2 hrs | Perf +5 |
| 2.4 Cache headers | 5 min | Perf +2 |
| 2.5 Conditional Prism.css | 30 min | Perf +1 |

**Total Phase 2: ~3 hours**

### Week 3+: Larger Tasks (Phase 3)
| Task | Time | Impact |
|------|------|--------|
| 3.1 PurgeCSS | 3 hrs | Perf +2 |
| 3.2 Self-host font | 1 hr | Perf +2 |
| 3.3 Service Worker | 4 hrs | UX |
| 3.5 Fix color contrast | 2 hrs | A11y +5 |

---

## Expected Final Scores

After implementing all phases:

| Metric | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|--------|---------|---------------|---------------|---------------|
| Performance | 87 | 93 | 98 | 99+ |
| Accessibility | 79 | 89 | 89 | 95+ |
| Best Practices | 96 | 100 | 100 | 100 |
| SEO | 83 | 98 | 100 | 100 |

### Core Web Vitals After Optimization

| Metric | Current | Expected |
|--------|---------|----------|
| FCP | 2.8s | ~1.5s |
| LCP | 3.2s | ~2.0s |
| TBT | 110ms | ~50ms |
| CLS | 0.029 | ~0.01 |

---

## Files to Modify Summary

| File | Phases |
|------|--------|
| `_includes/head.html` | 1.1, 1.2, 1.5, 2.2, 2.3, 2.5 |
| `_includes/font-includes.html` | 1.5, 3.2 |
| `_includes/custom-head.html` | 1.6 |
| `_includes/sidebar.html` | 1.3, 1.4 |
| `_includes/custom-foot.html` | 2.1 |
| `_data/site.json` | 1.1 |
| `_headers` | 1.7, 2.4 |
| `package.json` | 3.1 |
| `_sass/hydeout/_variables.scss` | 3.5 |
| `_sass/hydeout/_layout.scss` | 3.2, 3.5 |

---

## Monitoring & Validation

After each phase:
1. Run `npm run build`
2. Deploy to Cloudflare Pages (preview branch)
3. Test with PageSpeed Insights
4. Test with Lighthouse in Chrome DevTools
5. Verify no visual regressions

### Tools
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Lighthouse](chrome://inspect)
- [Accessibility Checker](https://wave.webaim.org/)

---

## Notes

1. **Disqus**: Already lazy-loaded with button click - good practice ✅
2. **Cloudflare Analytics**: Auto-injected, no action needed ✅
3. **CSS**: Already compressed via Sass `--style=compressed` ✅
4. **Main CSS size**: ~10KB compressed - very reasonable ✅
5. **Prism CSS**: ~2KB - minimal impact

The biggest wins will come from:
1. Removing unused Netlify Identity script (-46KB JS)
2. Font optimization (reduces FCP by ~0.5s)
3. Deferring Mailchimp (reduces TBT significantly)
4. Critical CSS inlining (reduces render-blocking time)
