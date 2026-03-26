import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In — Infometa Brand Portal',
  description: 'Sign in to your Infometa brand portal to manage products, batches, and QR codes.',
};

export default function LoginPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
      <p className="text-gray-500 mb-8">Sign in to your brand portal</p>
      <LoginForm />
      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
          Register your brand
        </Link>
      </p>
    </>
  );
}
