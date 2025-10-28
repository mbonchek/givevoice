'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrendingRedirect({ params }) {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const resolvedParams = await params;
      router.replace(`/patterns/${resolvedParams.pattern}`);
    };
    redirect();
  }, [params, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-600 font-light">Redirecting...</div>
    </div>
  );
}
