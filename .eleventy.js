import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import * as sass from "sass";
import postcss from "postcss";
import cssnano from "cssnano";
import purgecssModule from "@fullhuman/postcss-purgecss";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";

const purgecss = purgecssModule.default || purgecssModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store CSS content and hashes globally
const cssData = {
  main: { content: null, hash: null },
  prism: { content: null, hash: null }
};

// Helper function to generate content hash
function generateHash(content) {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 8);
}

// Pre-compile CSS and compute hashes synchronously
async function preCompileCSS() {
  const isProduction = process.env.NODE_ENV === "production" || process.env.ELEVENTY_RUN_MODE === "build";
  
  // Compile main.scss
  const scssPath = path.join(__dirname, "assets", "css", "main.scss");
  if (fs.existsSync(scssPath)) {
    const scssContent = fs.readFileSync(scssPath, "utf8");
    
    const result = sass.compileString(scssContent, {
      loadPaths: [
        path.join(__dirname, "_sass"),
        path.join(__dirname, "assets", "css")
      ],
      style: "expanded",
      sourceMap: false
    });
    
    let css = result.css;
    
    if (isProduction) {
      const postcssPlugins = [
        purgecss({
          content: [
            "./_layouts/**/*.html",
            "./_includes/**/*.html",
            "./_posts/**/*.md",
            "./*.html",
            "./*.md"
          ],
          safelist: {
            standard: [
              /^hljs/, /^prism/, /^token/, /^language-/, /^code-/, /^line-/,
              "sr-only", "visually-hidden"
            ],
            deep: [/^sidebar/, /^container/, /^content/],
            greedy: []
          },
          fontFace: true,
          keyframes: true
        }),
        cssnano({
          preset: ['default', {
            discardComments: { removeAll: true },
            normalizeWhitespace: true
          }]
        })
      ];
      
      const postcssResult = await postcss(postcssPlugins).process(css, { from: scssPath });
      css = postcssResult.css;
    }
    
    cssData.main.content = css;
    cssData.main.hash = generateHash(css);
  }
  
  // Read prism.css
  const prismPath = path.join(__dirname, "assets", "css", "prism.css");
  if (fs.existsSync(prismPath)) {
    const prismContent = fs.readFileSync(prismPath, "utf8");
    cssData.prism.content = prismContent;
    cssData.prism.hash = generateHash(prismContent);
  }
  
  console.log(`[CSS Hash] main.${cssData.main.hash}.css`);
  console.log(`[CSS Hash] prism.${cssData.prism.hash}.css`);
}

// Run pre-compilation synchronously at module load
await preCompileCSS();

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
  // SCSS COMPILATION WITH POSTCSS
  // ============================================
  
  // Add SCSS as a template format (disabled - using pre-compiled CSS)
  // We pre-compile CSS before Eleventy runs to ensure hashes are available for templates
  eleventyConfig.addTemplateFormats("scss");
  
  // Configure SCSS to skip processing (we handle it in pre-compilation)
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    
    compileOptions: {
      permalink: function(contents, inputPath) {
        // Skip all SCSS files - we handle CSS output in eleventy.after
        return false;
      }
    },
    
    compile: async function(inputContent, inputPath) {
      // Skip all SCSS - we pre-compile
      return;
    }
  });
  
  // Write hashed CSS files after build
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    const cssDir = path.join(dir.output, "assets", "css");
    
    // Ensure CSS directory exists
    if (!fs.existsSync(cssDir)) {
      fs.mkdirSync(cssDir, { recursive: true });
    }
    
    // Write main CSS with hash
    if (cssData.main.content && cssData.main.hash) {
      const hashedPath = path.join(cssDir, `main.${cssData.main.hash}.css`);
      fs.writeFileSync(hashedPath, cssData.main.content);
      console.log(`[CSS] Written main.${cssData.main.hash}.css`);
    }
    
    // Write prism CSS with hash
    if (cssData.prism.content && cssData.prism.hash) {
      const hashedPath = path.join(cssDir, `prism.${cssData.prism.hash}.css`);
      fs.writeFileSync(hashedPath, cssData.prism.content);
      console.log(`[CSS] Written prism.${cssData.prism.hash}.css`);
    }
  });
  
  // Expose CSS hashes to templates via global data
  eleventyConfig.addGlobalData("cssHash", {
    main: cssData.main.hash,
    prism: cssData.prism.hash
  });

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
  // Note: prism.css is handled via CSS hashing, not passthrough
  eleventyConfig.addPassthroughCopy("admin");
  
  // Copy favicons from root
  eleventyConfig.addPassthroughCopy("favicon.ico");
  eleventyConfig.addPassthroughCopy("favicon.png");
  
  // Copy Cloudflare Pages config files
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("_headers");

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
