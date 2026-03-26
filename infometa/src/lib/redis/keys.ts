export const REDIS_KEYS = {
  verifyToken:   (token: string) => `verify:${token}`,
  product:       (id: string) => `product:${id}`,
  brand:         (id: string) => `brand:${id}`,
  scanCount:     (token: string) => `scan_count:${token}`,
  alertCount:    (brandId: string) => `alert_count:${brandId}`,
  dashboardKpis: (brandId: string) => `dashboard:kpis:${brandId}`,
  rateLimit:     (ip: string) => `rl:${ip}`,
};

export const TTL = {
  VERIFY:    300,   // 5 minutes
  PRODUCT:   3600,  // 1 hour
  BRAND:     1800,  // 30 minutes
  DASHBOARD: 300,   // 5 minutes
  ALERT:     600,   // 10 minutes
};
