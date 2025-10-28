import Auth from '@/components/Auth';
import Link from 'next/link';

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-8">
      <Link href="/" className="mb-12">
        <h1 className="text-lg font-normal text-gray-500">givevoice.to</h1>
      </Link>
      <Auth />
    </div>
  );
}
