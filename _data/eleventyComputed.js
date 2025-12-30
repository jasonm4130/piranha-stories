// Data cascade for default layouts and permalinks
// This mimics Jekyll's default front matter behavior

export default {
  // Set default layout based on file location
  layout: (data) => {
    // If layout is explicitly set to false or null, don't use a layout
    if (data.layout === false || data.layout === null || data.layout === "") {
      return false;
    }
    
    // If layout is already set in front matter, use it
    if (data.layout) {
      return data.layout;
    }
    
    // Posts default to "post" layout
    if (data.page.inputPath && data.page.inputPath.includes("_posts/")) {
      return "post";
    }
    
    // For pages without front matter layout, return undefined (no layout)
    return undefined;
  },

  // Generate Jekyll-compatible permalinks for posts
  permalink: (data) => {
    // If permalink is already set, use it
    if (data.permalink) {
      return data.permalink;
    }

    // For posts, generate pretty URLs: /YYYY/MM/DD/title/
    if (data.page.inputPath && data.page.inputPath.includes("_posts/")) {
      const date = data.page.date || data.date;
      if (date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        // Extract title from filename (remove date prefix)
        const filename = data.page.fileSlug;
        
        return `/${year}/${month}/${day}/${filename}/`;
      }
    }

    return data.page.filePathStem + "/";
  }
};
