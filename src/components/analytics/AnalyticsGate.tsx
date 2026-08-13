'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsGate() {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch('/api/analytics-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <form onSubmit={submit} className="w-full max-w-xs border border-line p-8">
        <p className="font-hud text-[10px] uppercase tracking-widest text-muted">Restricted</p>
        <input
          type="password"
          autoFocus
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="mt-4 w-full border border-line bg-transparent px-4 py-3 font-hud text-sm text-fg outline-none focus:border-accent"
          placeholder="Key"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full border border-fg py-3 font-hud text-xs uppercase tracking-widest text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          {loading ? '…' : 'Enter'}
        </button>
        {error && <p className="mt-3 font-hud text-xs text-accent">Incorrect.</p>}
      </form>
    </div>
  );
}
