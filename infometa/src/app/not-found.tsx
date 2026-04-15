import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-teal-700 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Go Home
          </Link>
          <Link
            href="/verify"
            className="inline-flex items-center justify-center border border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold py-3 px-6 rounded-lg transition"
          >
            Verify a Product
          </Link>
        </div>
      </div>
    </main>
  );
}
