import useSWR from 'swr';

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export function useProducts(page = 1, limit = 20, search?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  return useSWR(`/api/products?${params}`, fetcher);
}

export function useBatches(page = 1, limit = 20) {
  return useSWR(`/api/batches?page=${page}&limit=${limit}`, fetcher);
}

export function useCodes(page = 1, limit = 20, batchId?: string, status?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (batchId) params.set('batchId', batchId);
  if (status) params.set('status', status);
  return useSWR(`/api/codes?${params}`, fetcher);
}

export function useScans(page = 1, limit = 20, result?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (result) params.set('result', result);
  return useSWR(`/api/scans?${params}`, fetcher);
}

export function useAlerts(page = 1, limit = 20, resolved?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (resolved) params.set('resolved', resolved);
  return useSWR(`/api/alerts?${params}`, fetcher);
}

export function useDashboardSummary() {
  return useSWR('/api/reports/summary', fetcher);
}

export function useAnalytics(period = '30d') {
  return useSWR(`/api/reports/analytics?period=${period}`, fetcher);
}
