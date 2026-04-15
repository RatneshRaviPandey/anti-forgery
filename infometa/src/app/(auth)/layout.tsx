import { Shield } from 'lucide-react';
import Link from 'next/link';
import { AuthPageGuard } from '@/components/auth/AuthPageGuard';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthPageGuard>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-teal-800 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 mb-8">
            <Shield className="w-10 h-10" />
            <span className="text-2xl font-bold">Infometa</span>
          </Link>
          <h1 className="text-4xl font-bold leading-tight mt-16">
            Protect your brand.<br />
            Verify every product.
          </h1>
          <p className="text-teal-200 mt-6 text-lg leading-relaxed max-w-md">
            Join 500+ brands using Infometa&apos;s cryptographic QR codes to fight counterfeiting
            and build consumer trust.
          </p>
        </div>
        <div className="relative z-10 text-teal-300 text-sm">
          © {new Date().getFullYear()} Infometa Technologies Pvt Ltd
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-teal-700" />
            <span className="text-xl font-bold text-gray-900">Infometa</span>
          </div>
          {children}
        </div>
      </div>
    </div>
    </AuthPageGuard>
  );
}
