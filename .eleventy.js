import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default function(eleventyConfig) {
  // ============================================
  // IGNORES - Files that should not be processed
  // ============================================
  
  // Ignore Jekyll-specific files and non-content files
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("MIGRATION_PLAN.md");
  eleventyConfig.ignores.add("LICENSE.md");
  eleventyConfig.ignores.add("Gemfile");
  eleventyConfig.ignores.add("Gemfile.lock");
  eleventyConfig.ignores.add("_config.yml");
  eleventyConfig.ignores.add("*.gemspec");
  eleventyConfig.ignores.add("vendor/**");
  eleventyConfig.ignores.add("node_modules/**");
  
  // Ignore Jekyll layouts and includes during Phase 1 (we'll migrate them in Phase 2)
  // For now, we just want to confirm the build pipeline works
  eleventyConfig.ignores.add("_layouts/**");
  eleventyConfig.ignores.add("_includes/**");
  eleventyConfig.ignores.add("_posts/**");
  
  // Ignore existing Jekyll pages that use incompatible Liquid syntax
  eleventyConfig.ignores.add("index.html");
  eleventyConfig.ignores.add("about.md");
  eleventyConfig.ignores.add("404.html");
  eleventyConfig.ignores.add("search.html");
  eleventyConfig.ignores.add("subscribe.html");
  eleventyConfig.ignores.add("tags.html");
  eleventyConfig.ignores.add("admin/**");

  // ============================================
  // PLUGINS
  // ============================================
  
  // RSS Feed Plugin
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 10,
    },
    metadata: {
      language: "en",
      title: "Piranha Stories",
      subtitle: "Short stories to brighten your day.",
      base: "https://piranhastories.com/",
      author: {
        name: "Brian_AP",
        email: "",
      }
    }
  });

  // Syntax Highlighting Plugin
  eleventyConfig.addPlugin(syntaxHighlight);

  // ============================================
  // COLLECTIONS
  // ============================================
  
  // Posts collection - sorted by date descending (newest first)
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("_posts/**/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  // ============================================
  // FILTERS
  // ============================================
  
  // Date formatting filter (similar to Jekyll's date filter)
  eleventyConfig.addFilter("date", function(date, format) {
    const d = new Date(date);
    
    // Common format patterns
    const formats = {
      "%Y": d.getFullYear(),
      "%m": String(d.getMonth() + 1).padStart(2, '0'),
      "%d": String(d.getDate()).padStart(2, '0'),
      "%B": d.toLocaleDateString('en-US', { month: 'long' }),
      "%b": d.toLocaleDateString('en-US', { month: 'short' }),
      "%e": d.getDate(),
    };
    
    let result = format || "%Y-%m-%d";
    for (const [pattern, value] of Object.entries(formats)) {
      result = result.replace(pattern, value);
    }
    
    return result;
  });

  // XML escape filter for RSS
  eleventyConfig.addFilter("xmlEscape", function(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  });

  // ============================================
  // PASSTHROUGH COPY
  // ============================================
  
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets/img");
  eleventyConfig.addPassthroughCopy("admin");

  // ============================================
  // LAYOUT ALIASES
  // ============================================
  
  // Allow using layout names without path prefix (Jekyll compatibility)
  eleventyConfig.addLayoutAlias("default", "default.html");
  eleventyConfig.addLayoutAlias("post", "post.html");
  eleventyConfig.addLayoutAlias("page", "page.html");
  eleventyConfig.addLayoutAlias("index", "index.html");
  eleventyConfig.addLayoutAlias("category", "category.html");
  eleventyConfig.addLayoutAlias("search", "search.html");
  eleventyConfig.addLayoutAlias("tags", "tags.html");

  // ============================================
  // WATCH TARGETS
  // ============================================
  
  // Watch SCSS files for changes
  eleventyConfig.addWatchTarget("_sass/");

  // ============================================
  // CONFIGURATION
  // ============================================
  
  return {
    // Use Liquid as the template engine (Jekyll compatibility)
    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "liquid",
    
    // Directory structure
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    },

    // Template formats to process
    templateFormats: ["md", "html", "liquid", "njk"]
  };
}
