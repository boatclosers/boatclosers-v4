'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'needsAuth' | 'accepting' | 'error' | 'done'>('checking');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        sessionStorage.setItem('pendingInviteToken', token as string);
        setStatus('needsAuth');
        return;
      }

      setStatus('accepting');

      const res = await fetch('/api/deals/invite/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId: session.user.id }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrorMsg(result.error || 'Something went wrong');
        setStatus('error');
        return;
      }

      setStatus('done');
      router.push(`/deal/${result.dealId}`);
    };

    run();
  }, [token, router]);

  if (status === 'checking' || status === 'accepting') {
    return <div className="flex min-h-screen items-center justify-center text-gray-600">Loading your invite...</div>;
  }

  if (status === 'needsAuth') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2">You've been invited to a deal on BoatClosers</h1>
          <p className="text-gray-600 mb-6">Sign in or create an account to view the deal details.</p>
          <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold mb-2 text-red-600">Invite Error</h1>
          <p className="text-gray-600">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return null;
}
