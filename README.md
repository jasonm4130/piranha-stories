# Piranha Stories

A collection of short stories by [Brian_AP](https://www.reddit.com/user/Brian_AP).

**Live site:** [piranhastories.com](https://piranhastories.com)

## Tech Stack

- **Static Site Generator:** [Eleventy (11ty)](https://www.11ty.dev/) v3.x
- **Styling:** SCSS (Hydeout theme)
- **Hosting:** [Cloudflare Pages](https://pages.cloudflare.com/)
- **Analytics:** Cloudflare Web Analytics

## Development

### Prerequisites

- Node.js 20.x

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Site will be available at http://localhost:8080/

### Build

```bash
npm run build
```

Output is generated in `_site/` directory.

## Deployment

The site automatically deploys to Cloudflare Pages on push to the `master` branch.

## License

Content copyright Brian_AP. Theme based on [Hydeout](https://github.com/fongandrew/hydeout).
