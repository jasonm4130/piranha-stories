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
  eleventyConfig.ignores.add("plans/**");
  eleventyConfig.ignores.add("_sass/**");
  eleventyConfig.ignores.add("_screenshots/**");
  
  // Subscribe page not needed in Eleventy (RSS handled by plugin)
  eleventyConfig.ignores.add("subscribe.html");
  eleventyConfig.ignores.add("eleventy-test.html");

  // ============================================
  // PLUGINS
  // ============================================
  
  // RSS Feed Plugin
  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 0,  // 0 = no limit, include all posts
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

  // Tags collection - returns an object with tag names as keys and arrays of posts as values
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const tagSet = new Set();
    collectionApi.getAll().forEach(item => {
      if (item.data.tags) {
        item.data.tags.forEach(tag => {
          if (tag !== "posts" && tag !== "all") {
            tagSet.add(tag);
          }
        });
      }
    });
    return [...tagSet].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  });

  // Posts by tag - for use in templates
  eleventyConfig.addCollection("postsByTag", function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob("_posts/**/*.md");
    const tagMap = {};
    
    posts.forEach(post => {
      if (post.data.tags) {
        post.data.tags.forEach(tag => {
          if (tag !== "posts" && tag !== "all") {
            if (!tagMap[tag]) {
              tagMap[tag] = [];
            }
            tagMap[tag].push(post);
          }
        });
      }
    });

    // Sort posts within each tag by date (newest first)
    for (const tag in tagMap) {
      tagMap[tag].sort((a, b) => b.date - a.date);
    }

    return tagMap;
  });

  // Pages collection - for sidebar navigation
  eleventyConfig.addCollection("sidebarPages", function(collectionApi) {
    return collectionApi.getAll().filter(item => {
      return item.data.sidebar_link === true;
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

  // date_to_string filter (Jekyll compatibility) - "17 Nov 2017"
  eleventyConfig.addFilter("date_to_string", function(date) {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  });

  // number_of_words filter (Jekyll compatibility)
  eleventyConfig.addFilter("number_of_words", function(content) {
    if (!content) return 0;
    return content.split(/\s+/).filter(word => word.length > 0).length;
  });

  // slugify filter for URL-safe strings
  eleventyConfig.addFilter("slugify", function(str) {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  });

  // first filter - get first item or first n items from array
  eleventyConfig.addFilter("first", function(arr, n) {
    if (!arr) return arr;
    if (n === undefined) {
      return Array.isArray(arr) ? arr[0] : arr;
    }
    return arr.slice(0, n);
  });

  // last filter - get last item from array
  eleventyConfig.addFilter("last", function(arr) {
    if (!arr || !Array.isArray(arr)) return arr;
    return arr[arr.length - 1];
  });

  // size filter - returns length of array or string
  eleventyConfig.addFilter("size", function(arr) {
    if (!arr) return 0;
    return arr.length;
  });

  // where filter - filter array by property value
  eleventyConfig.addFilter("where", function(arr, key, value) {
    if (!arr) return [];
    return arr.filter(item => {
      const itemValue = item.data ? item.data[key] : item[key];
      return itemValue === value;
    });
  });

  // absolute_url filter - prepends site URL
  eleventyConfig.addFilter("absolute_url", function(url) {
    const siteUrl = "https://piranhastories.com";
    if (!url) return siteUrl;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return siteUrl + url;
  });

  // replace_first filter (Jekyll compatibility)
  eleventyConfig.addFilter("replace_first", function(str, search, replace) {
    if (!str) return '';
    return str.replace(search, replace || '');
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

  // limit filter - limit array to n items
  eleventyConfig.addFilter("limit", function(arr, n) {
    if (!arr) return [];
    return arr.slice(0, n);
  });

  // ============================================
  // PASSTHROUGH COPY
  // ============================================
  
  // Copy static assets
  eleventyConfig.addPassthroughCopy("assets/img");
  eleventyConfig.addPassthroughCopy("assets/css/prism.css");
  eleventyConfig.addPassthroughCopy("admin");
  
  // Copy favicons from root
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("favicon.png");

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
