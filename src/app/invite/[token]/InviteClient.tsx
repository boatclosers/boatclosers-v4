'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InviteClient() {
  const params = useParams();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const router = useRouter();

  const [mode, setMode] = useState('signup'); // signup | signin
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (mode === 'signup' && !fullName) { setError('Please enter your name.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/deals/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password, fullName, mode })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Something went wrong. Please try again.');
        setBusy(false);
        return;
      }
      // Write the SAME session the main app reads, so it loads us straight in.
      try {
        localStorage.setItem('bc_session', JSON.stringify({
          token: data.token,
          userId: data.user.id,
          name: data.user.fullName,
          email: data.user.email,
          role: data.role,
          dealId: data.dealId
        }));
      } catch (e) {}
      // Force a FULL page load (not client-side nav) so the app boots fresh,
      // reads the new bc_session, and loads the deal this person just joined.
      window.location.href = '/';
    } catch (e) {
      setError('Network problem. Please try again.');
      setBusy(false);
    }
  };

  const wrap = { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 1rem', fontFamily:'sans-serif', background:'#f8fafc' };
  const card = { width:'100%', maxWidth:420, background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:28, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' };
  const input = { width:'100%', padding:'10px 12px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:14, marginTop:6, marginBottom:14, boxSizing:'border-box' as const };
  const label = { fontSize:12, fontWeight:600, color:'#334155' };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ textAlign:'center', marginBottom:18 }}>
          <div style={{ fontSize:16, fontWeight:700, letterSpacing:1, color:'#08152e' }}>BOATCLOSERS</div>
          <div style={{ fontSize:11, color:'#94a3b8', letterSpacing:1 }}>PRIVATE VESSEL TRANSACTIONS</div>
        </div>

        <h1 style={{ fontSize:18, fontWeight:600, color:'#08152e', marginBottom:6, textAlign:'center' }}>
          You've been invited to a deal
        </h1>
        <p style={{ fontSize:13, color:'#64748b', textAlign:'center', marginBottom:20 }}>
          {mode === 'signup'
            ? 'Create your account to join the deal. Your email will be connected automatically.'
            : 'Sign in to join the deal.'}
        </p>

        {mode === 'signup' && (
          <>
            <div style={label}>Full Legal Name</div>
            <input style={input} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name" />
          </>
        )}

        <div style={label}>Email</div>
        <input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />

        <div style={label}>Password</div>
        <input style={input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Choose a password" />

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', borderRadius:8, padding:'8px 12px', fontSize:13, marginBottom:14 }}>
            {error}
          </div>
        )}

        <button onClick={submit} disabled={busy} style={{ width:'100%', background:'#b8863a', color:'#08152e', border:'none', borderRadius:8, padding:'12px', fontSize:15, fontWeight:700, cursor: busy?'default':'pointer', opacity: busy?0.6:1 }}>
          {busy ? 'Joining…' : (mode === 'signup' ? 'Create Account & Join Deal' : 'Sign In & Join Deal')}
        </button>

        <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#64748b' }}>
          {mode === 'signup'
            ? <span>Already have an account? <span onClick={()=>{setMode('signin');setError('');}} style={{ color:'#1e3a5f', fontWeight:600, cursor:'pointer' }}>Sign in</span></span>
            : <span>Need an account? <span onClick={()=>{setMode('signup');setError('');}} style={{ color:'#1e3a5f', fontWeight:600, cursor:'pointer' }}>Create one</span></span>}
        </div>
      </div>
    </div>
  );
}
