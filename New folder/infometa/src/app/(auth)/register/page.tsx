import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Register — Infometa Brand Portal',
  description: 'Register your brand on Infometa to protect your products with cryptographic QR codes.',
};

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your brand account</h2>
      <p className="text-gray-500 mb-8">Start your 14-day free trial — no credit card required</p>
      <RegisterForm />
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
