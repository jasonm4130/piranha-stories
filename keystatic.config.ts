import { config, fields, collection } from '@keystatic/core';

// Determine storage based on environment
const storage =
  process.env.NODE_ENV === 'production'
    ? { kind: 'github' as const, repo: 'jasonm4130/piranha-stories' as const }
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
        }),
      },
    }),

    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { contentField: 'content' },
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
        }),
      },
    }),
  },
});
