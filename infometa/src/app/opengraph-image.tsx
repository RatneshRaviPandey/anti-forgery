import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Infometa Technologies — Scan. Verify. Trust.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0F766E 0%, #065F5A 50%, #0D4F4C 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 800,
              color: 'white',
            }}
          >
            🛡️
          </div>
          <span style={{ color: 'white', fontSize: '36px', fontWeight: 700 }}>
            Infometa Technologies
          </span>
        </div>

        <h1
          style={{
            color: 'white',
            fontSize: '56px',
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.2,
            margin: '0 0 16px',
          }}
        >
          Scan. Verify. Trust.
        </h1>

        <p
          style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '24px',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
          }}
        >
          Real-time QR-based product authentication &amp; anti-counterfeit
          verification platform for brands across India.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '40px',
            color: 'rgba(255,255,255,0.7)',
            fontSize: '18px',
          }}
        >
          <span>✓ 200+ Brands</span>
          <span>•</span>
          <span>✓ 12 Industries</span>
          <span>•</span>
          <span>✓ 99.99% Uptime</span>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '16px',
          }}
        >
          infometa.in
        </div>
      </div>
    ),
    { ...size },
  );
}
