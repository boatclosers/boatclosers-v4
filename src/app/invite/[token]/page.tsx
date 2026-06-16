'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InvitePage() {
  const params = useParams();
const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const run = async () => {
      let session = null;
      try {
        const stored = localStorage.getItem('bc_session');
        if (stored) session = JSON.parse(stored);
      } catch (e) {}

      if (!session?.token || !session?.userId) {
        try { sessionStorage.setItem('pendingInviteToken', token); } catch (e) {}
        setStatus('needsAuth');
        return;
      }

      setStatus('accepting');

      try {
        const res = await fetch('/api/deals/invite/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, userId: session.userId }),
        });
        const result = await res.json();

        if (!res.ok) {
          setStatus('error');
          return;
        }

        router.push('/');
      } catch (e) {
        setStatus('error');
      }
    };

    run();
  }, [token, router]);

  if (status === 'checking' || status === 'accepting') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#475569' }}>
        Loading your invite...
      </div>
    );
  }

  if (status === 'needsAuth') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>You've been invited to a deal on BoatClosers</h1>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Sign in or create an account to continue. We'll connect you to the deal automatically.</p>
          <a href="/" style={{ display: 'inline-block', background: '#1e3a5f', color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
            Go to Sign In
          </a>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 1rem', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#dc2626' }}>Invite Link Problem</h1>
          <p style={{ color: '#64748b' }}>This invite link is invalid, expired, or already used. Ask the other party to resend it.</p>
          <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#1e3a5f', fontWeight: 600 }}>
            Go to BoatClosers
          </a>
        </div>
      </div>
    );
  }

  return null;
} 
