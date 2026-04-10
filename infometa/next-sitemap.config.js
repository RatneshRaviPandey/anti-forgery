/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://infometa.tech",
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ["/admin/*", "/admin", "/status", "/cookies"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ],
    additionalSitemaps: ["https://infometa.tech/sitemap.xml"],
  },
  transform: async (config, path) => {
    // Higher priority for key pages
    const highPriority = ["/", "/verify", "/brands", "/pricing", "/contact"];
    const mediumPriority = ["/about", "/industries", "/resources", "/case-studies"];

    let priority = config.priority;
    let changefreq = config.changefreq;

    if (highPriority.includes(path)) {
      priority = 1.0;
      changefreq = "daily";
    } else if (mediumPriority.includes(path)) {
      priority = 0.8;
      changefreq = "weekly";
    } else if (path.startsWith("/industries/")) {
      priority = 0.8;
      changefreq = "monthly";
    } else if (path.startsWith("/resources/")) {
      priority = 0.6;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
