import { config, fields, collection } from '@keystatic/core';

/**
 * Keystatic CMS Configuration
 * 
 * Storage modes:
 * - Development: Uses 'local' storage (files saved directly to disk)
 * - Production: Uses 'github' storage (commits to GitHub repo)
 * 
 * Required environment variables for production (GitHub mode):
 * - KEYSTATIC_GITHUB_CLIENT_ID: GitHub App client ID
 * - KEYSTATIC_GITHUB_CLIENT_SECRET: GitHub App client secret
 * - KEYSTATIC_SECRET: Secret for signing tokens
 * - PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: GitHub App slug name
 * 
 * These are auto-generated when you first connect to GitHub from /keystatic
 */

// Determine storage based on environment
const isProd = import.meta.env.PROD;

const storage = isProd
  ? {
      kind: 'github' as const,
      repo: 'jasonm4130/piranha-stories' as `${string}/${string}`,
    }
  : { kind: 'local' as const };

export default config({
  storage,

  ui: {
    brand: {
      name: 'Piranha Stories',
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
          name: { label: 'Title' },
        }),
        date: fields.datetime({
          label: 'Date',
          defaultValue: { kind: 'now' },
        }),
        excerpt: fields.text({
          label: 'Excerpt',
          multiline: true,
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        categories: fields.array(fields.text({ label: 'Category' }), {
          label: 'Categories',
          itemLabel: (props) => props.value,
        }),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/posts',
              publicPath: '/images/posts/',
            },
          },
        }),
      },
    }),

    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
        }),
        sidebarLink: fields.checkbox({
          label: 'Show in Sidebar',
          defaultValue: false,
        }),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: 'public/images/pages',
              publicPath: '/images/pages/',
            },
          },
        }),
      },
    }),
  },
});
