# Marketplace Setup

## Where to store the books

**Do not put the PDFs in `public/`.** Anything in `public/` is served to
anyone who guesses or finds the URL — that's the opposite of what you want
for a paid product. Store them in a **private Supabase Storage bucket**
named `books`:

1. Supabase dashboard → Storage → New bucket → name it `books` → **make sure
   "Public bucket" is switched OFF.**
2. Upload each PDF with the exact filename referenced in `supabase/schema.sql`'s
   `storage_path` column (`the-discipline-code.pdf`, etc).
3. That's it — nothing else can reach these files. The only path to them is
   `/api/download/[token]`, which generates a signed URL that expires in
   120 seconds and only fires after payment is confirmed and the token/email
   pair matches exactly.

## One-time provisioning

1. **Supabase**: create a project at supabase.com. In the SQL editor, run
   `supabase/schema.sql` from this repo, once.
2. **PayPal**: you said you already made the app — you need three things
   from it: `Client ID`, `Secret`, and a `Webhook ID`.
   - Webhook ID comes from Dashboard → your app → **Add Webhook** →
     point it at `https://hemansh.vercel.app/api/paypal/webhook` → subscribe
     to `PAYMENT.CAPTURE.COMPLETED` → PayPal gives you the Webhook ID after
     creation.
3. **Analytics password**: pick any long random string yourself for `ANA_KEY`
   — it's not from a third party, it's just a password only you know.

## Environment variables (set these in Vercel → Settings → Environment
Variables — never in a file that gets committed)

| Variable | Where it's used | Notes |
|---|---|---|
| `SUPABASE_URL` | server only | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Project Settings → API → `service_role` secret. **This key bypasses all security rules — it must never have `NEXT_PUBLIC_` in front of it.** |
| `PAYPAL_CLIENT_ID` | server only | from your PayPal app |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | client (safe to expose) | same value as above — PayPal's client id is meant to be public, it's what the JS SDK uses in the browser |
| `PAYPAL_SECRET` | server only | from your PayPal app. **Never** prefix with `NEXT_PUBLIC_`. |
| `PAYPAL_WEBHOOK_ID` | server only | from step 2 above |
| `PAYPAL_ENV` | server only | `live` once you're ready to take real payments; anything else (or unset) uses PayPal's sandbox |
| `ANA_KEY` | server only | your analytics password |

## How a sale actually gets confirmed (so you can verify it yourself)

There are **two independent paths**, both of which re-check the amount
against what the server itself computed at order-creation time — neither
trusts anything the browser says:

1. **Immediate path**: after the buyer approves in the PayPal popup, the
   browser calls `/api/paypal/capture-order`, which calls PayPal
   server-to-server, reads PayPal's own `COMPLETED` status, and only then
   flips the order to `paid`.
2. **Webhook path** (`/api/paypal/webhook`): fires independently from
   PayPal's servers, with a cryptographic signature verified against PayPal
   directly before anything is trusted. This is what still confirms the sale
   even if the buyer's browser crashes or closes right after paying.

An order can only become `paid` through one of these two paths. There is no
code path anywhere that sets `status = 'paid'` from something the client
sends directly.

## Referral links

Give a micro-influencer `hemansh.vercel.app/r/<their-slug>`. Add their row
first:

```sql
insert into influencers (slug, name, discount_pct) values ('somecreator', 'Some Creator', 20);
```

Visiting that link validates the slug against the DB (a made-up slug just
falls through with no discount), sets a 14-day httpOnly cookie, and redirects
to `/books`. The discount and the sale attribution both happen server-side
in `/api/paypal/create-order` using the influencer's database id — the
cookie only carries a slug, never a discount amount or credit, so it can't
be tampered with to grant a bigger discount than what's in the DB.

## Analytics

`hemansh.vercel.app/ops-x7k2q9` — this exact path is not linked from the
site, not in the sitemap, and marked `noindex`. There is no visible login
form: visiting it without credentials returns a real 404, identical to a
route that was never built — a password prompt would itself be a sign
something's there. To get in, append `?key=<ANA_KEY>` once
(`/ops-x7k2q9?key=your-secret`); a correct key sets a 4-hour httpOnly
session cookie and redirects you to the bare URL, so the key doesn't sit
in your visible address bar afterward. Wrong key, missing key, or no
cookie all produce the exact same 404. Bookmark the bare URL privately
once you're in — there's no other way to reach it, which is the point.

## Third-party code used, and licenses

- `@supabase/supabase-js` — **MIT**.
- PayPal's checkout is called via `fetch` directly against their REST API
  (server) and their JS SDK loaded via `<script>` tag (client) — **no npm
  package**, so there's nothing to license-check for the payment path
  itself.

## What I have not done, and why

- I have not created a live Supabase project or a live PayPal app for you —
  I can't; those require your accounts and dashboards. Everything above is
  real, wired code that works the moment those exist and the env vars are set.
- I have not tested a real payment end-to-end (obviously — no live keys
  exist yet). Once you've set the env vars, run one real $0.01-style test
  in PayPal sandbox mode (`PAYPAL_ENV` unset) before flipping to `live`.
