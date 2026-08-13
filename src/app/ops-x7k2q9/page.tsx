import { cookies } from 'next/headers';
import crypto from 'crypto';
import type { Metadata } from 'next';
import AnalyticsGate from '@/components/analytics/AnalyticsGate';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

// noindex/nofollow on this exact route, and it is never linked from Nav,
// sitemap.ts, or anywhere else in the site — the URL itself is the secret,
// same as the ANA_KEY password behind it.
export const metadata: Metadata = { robots: { index: false, follow: false } };

function isAuthed(): boolean {
  const real = process.env.ANA_KEY;
  if (!real) return false;
  const session = cookies().get('ana_session')?.value;
  if (!session) return false;
  const expected = crypto.createHash('sha256').update(real).digest('hex');
  const a = Buffer.from(session);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function getStats() {
  const sb = supabaseAdmin();

  const [{ data: paidOrders }, { data: allOrders }, { data: books }, { data: influencers }, { data: downloads }] =
    await Promise.all([
      sb.from('orders').select('*').eq('status', 'paid').order('paid_at', { ascending: false }),
      sb.from('orders').select('status'),
      sb.from('books').select('id, title, slug'),
      sb.from('influencers').select('id, slug, name, discount_pct'),
      sb.from('downloads').select('order_id, download_count, email, claimed_at'),
    ]);

  const revenue = (paidOrders ?? []).reduce((sum, o) => sum + o.amount_cents, 0) / 100;
  const failedCount = (allOrders ?? []).filter((o) => o.status === 'failed').length;
  const pendingCount = (allOrders ?? []).filter((o) => o.status === 'pending').length;

  const byBook = (books ?? []).map((b) => {
    const orders = (paidOrders ?? []).filter((o) => o.book_id === b.id);
    return {
      title: b.title,
      count: orders.length,
      revenue: orders.reduce((s, o) => s + o.amount_cents, 0) / 100,
    };
  });

  const byInfluencer = (influencers ?? []).map((inf) => {
    const orders = (paidOrders ?? []).filter((o) => o.influencer_id === inf.id);
    return {
      name: inf.name,
      slug: inf.slug,
      count: orders.length,
      revenue: orders.reduce((s, o) => s + o.amount_cents, 0) / 100,
    };
  });

  const claimedCount = (downloads ?? []).filter((d) => d.claimed_at).length;
  const totalDownloadHits = (downloads ?? []).reduce((s, d) => s + d.download_count, 0);

  return {
    revenue,
    paidCount: (paidOrders ?? []).length,
    failedCount,
    pendingCount,
    byBook,
    byInfluencer,
    claimedCount,
    totalDownloadHits,
    recent: (paidOrders ?? []).slice(0, 20),
  };
}

export default async function AnalyticsPage() {
  if (!isAuthed()) return <AnalyticsGate />;

  let stats;
  try {
    stats = await getStats();
  } catch {
    return (
      <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-center">
        <p className="font-hud text-sm text-muted">Supabase isn&apos;t configured yet — see SETUP.md.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl uppercase tracking-widest2 text-shine">Analytics</h1>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
          <Stat label="Paid Orders" value={String(stats.paidCount)} />
          <Stat label="Pending" value={String(stats.pendingCount)} />
          <Stat label="Failed" value={String(stats.failedCount)} />
        </div>

        <Section title="By Book">
          <Table
            rows={stats.byBook.map((b) => [b.title, String(b.count), `$${b.revenue.toFixed(2)}`])}
            headers={['Title', 'Sales', 'Revenue']}
          />
        </Section>

        <Section title="By Influencer">
          <Table
            rows={stats.byInfluencer.map((i) => [i.name, `/r/${i.slug}`, String(i.count), `$${i.revenue.toFixed(2)}`])}
            headers={['Name', 'Link', 'Sales', 'Revenue']}
          />
        </Section>

        <Section title="Downloads">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Claimed" value={String(stats.claimedCount)} />
            <Stat label="Total Fetches" value={String(stats.totalDownloadHits)} />
          </div>
        </Section>

        <Section title="Recent Paid Orders">
          <Table
            rows={stats.recent.map((o) => [
              new Date(o.paid_at).toLocaleString(),
              `$${(o.amount_cents / 100).toFixed(2)}`,
              o.buyer_email ?? '—',
            ])}
            headers={['Paid At', 'Amount', 'Email']}
          />
        </Section>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line p-4">
      <div className="font-hud text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className="mt-1 font-hud text-lg text-fg">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-12">
      <h2 className="font-hud text-xs uppercase tracking-widest text-accent">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[480px] text-left font-hud text-xs">
        <thead>
          <tr className="border-b border-line">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 uppercase tracking-widest text-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-6 text-center text-muted">
                No data yet
              </td>
            </tr>
          )}
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-fg">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
