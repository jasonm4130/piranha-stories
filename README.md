# Piranha Stories

A collection of short stories by [Brian_AP](https://www.reddit.com/user/Brian_AP).

**Live site:** [piranhastories.com](https://piranhastories.com)

## Tech Stack

- **Framework:** [Astro](https://astro.build/) 5.x (static with hybrid SSR)
- **CMS:** [Keystatic](https://keystatic.com/) for content management
- **Styling:** SCSS (Hydeout theme)
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **Analytics:** Cloudflare Web Analytics

## Development

### Prerequisites

- Node.js 20.x or later
- npm 10.x or later

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Site will be available at http://localhost:4321/

Keystatic CMS is available at http://localhost:4321/keystatic

### Build

```bash
npm run build
```

Output is generated in `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Content Management

This site uses Keystatic CMS for content management. Access the admin interface at `/keystatic`.

- **Development:** Uses local file storage (no auth required)
- **Production:** Uses GitHub storage (requires GitHub authentication)

### Adding/Editing Posts

1. Navigate to `/keystatic` in your browser
2. Click "Posts" in the sidebar
3. Create new posts or edit existing ones
4. Changes are saved directly to the repository

## Deployment

The site is deployed to Cloudflare Pages with automatic deploys on push to the `master` branch.

### Cloudflare Pages Setup

1. Connect your GitHub repository to Cloudflare Pages
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 20
3. Add environment variables (see below)

### Environment Variables

The following environment variables are required for Keystatic in production:

| Variable | Description |
|----------|-------------|
| `KEYSTATIC_GITHUB_CLIENT_ID` | GitHub App Client ID |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | GitHub App Client Secret |
| `KEYSTATIC_SECRET` | Secret key for signing tokens |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | GitHub App slug name |

These are auto-generated when you first connect to GitHub from `/keystatic` in development. Copy them from your local `.env` file to Cloudflare Pages environment variables.

To add environment variables in Cloudflare:
1. Go to your Pages project settings
2. Navigate to Settings → Environment Variables
3. Add each variable for the Production environment

### Wrangler CLI Deployment (Optional)

You can also deploy using the Wrangler CLI:

```bash
# Install wrangler globally (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to Cloudflare Pages
wrangler pages deploy dist
```

## Project Structure

```
├── src/
│   ├── components/    # Astro components
│   ├── content/       # Content collections (posts, pages)
│   ├── layouts/       # Page layouts
│   ├── pages/         # Route pages
│   └── styles/        # SCSS styles
├── public/            # Static assets
├── keystatic.config.ts # Keystatic CMS configuration
├── astro.config.mjs   # Astro configuration
└── wrangler.toml      # Cloudflare Pages configuration
```

## License

Content copyright Brian_AP. Theme based on [Hydeout](https://github.com/fongandrew/hydeout).

