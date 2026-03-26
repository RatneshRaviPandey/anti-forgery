import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '0.0.0.0'
  );
}

export async function getGeoFromIP(ip: string) {
  try {
    if (ip === '0.0.0.0' || ip.startsWith('192.168') || ip.startsWith('127.') || ip.startsWith('10.')) {
      return { city: 'Local', country: 'IN', lat: 12.97, lng: 77.59 };
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=city,country,lat,lon`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return { city: data.city, country: data.country, lat: data.lat, lng: data.lon };
  } catch {
    return null;
  }
}

export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16);
}
