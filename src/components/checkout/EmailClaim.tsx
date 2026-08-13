'use client';

import { useState } from 'react';

export default function EmailClaim({ internalOrderId }: { internalOrderId: string }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/download/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ internalOrderId, email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Could not claim download');
      return;
    }
    setToken(data.token);
  };

  if (token) {
    return (
      <div className="border border-accent p-6">
        <p className="font-hud text-xs uppercase tracking-widest text-accent">Payment confirmed</p>
        <a
          href={`/api/download/${token}?email=${encodeURIComponent(email)}`}
          data-magnetic
          data-cursor-label="DOWNLOAD"
          className="mt-3 inline-block border border-fg px-6 py-3 font-hud text-xs uppercase tracking-widest text-fg transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          Download your book →
        </a>
        <p className="mt-3 font-body text-xs text-muted">
          This link is locked to {email}. Save it — you can return to this page any time to re-download.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="border border-line p-6">
      <p className="font-hud text-xs uppercase tracking-widest text-muted">Payment confirmed — one last step</p>
      <p className="mt-2 font-body text-sm text-muted">
        Enter the email your download should be locked to. This can only be set once.
      </p>
      <div className="mt-4 flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="flex-1 border border-line bg-transparent px-4 py-3 font-body text-sm text-fg outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading}
          data-magnetic
          data-cursor-label="CLAIM"
          className="border border-fg px-6 py-3 font-hud text-xs uppercase tracking-widest text-fg transition-colors duration-300 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {loading ? 'Claiming…' : 'Claim'}
        </button>
      </div>
      {error && <p className="mt-3 font-hud text-xs text-accent">{error}</p>}
    </form>
  );
}
