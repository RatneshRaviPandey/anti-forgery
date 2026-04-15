import { redirect } from 'next/navigation';

// When a user scans a QR code that points to /verify/{token},
// redirect to the friendly verify page with the token as a query param.
// This also handles legacy /api/verify/{token} URLs if hit from a browser.
export default async function VerifyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/verify?code=${encodeURIComponent(token)}`);
}
