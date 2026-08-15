'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Book } from '@/lib/data/books';
import PayPalButton from './PayPalButton';
import EmailClaim from './EmailClaim';
import BookCoverFallback from './BookCoverFallback';

export default function BookPurchaseCard({
  book,
  discountPct,
  large = false,
}: {
  book: Book;
  discountPct: number;
  large?: boolean;
}) {
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);
  const [coverFailed, setCoverFailed] = useState(false);
  const displayPrice = ((book.priceCents * (1 - discountPct / 100)) / 100).toFixed(2);

  return (
    <div className={`border border-line bg-[#050505] p-6 ${large ? 'sm:p-10' : ''}`}>
      <div className={`grid gap-6 ${large ? 'sm:grid-cols-[220px_1fr] sm:items-center' : ''}`}>
        <div className={`relative overflow-hidden border border-line bg-[#0a0a0a] ${large ? 'aspect-[2/3]' : 'aspect-[2/3] mb-4'}`}>
          {coverFailed ? (
            <BookCoverFallback title={book.title} large={large} />
          ) : (
            <Image
              src={book.cover}
              alt={book.title}
              fill
              sizes="220px"
              className="object-cover"
              onError={() => setCoverFailed(true)}
            />
          )}
        </div>
        <div>
          <h3 className={`font-display uppercase tracking-wide text-fg ${large ? 'text-3xl' : 'text-lg'}`}>
            {book.title}
          </h3>
          <p className="mt-3 font-body text-sm leading-relaxed text-muted">{book.description}</p>

          <div className="mt-5 flex items-baseline gap-2">
            {discountPct > 0 && (
              <span className="font-hud text-xs text-muted line-through">${(book.priceCents / 100).toFixed(2)}</span>
            )}
            <span className="font-hud text-xl text-fg">${displayPrice}</span>
            {discountPct > 0 && (
              <span className="border border-accent px-2 py-0.5 font-hud text-[10px] uppercase tracking-widest text-accent">
                {discountPct}% off applied
              </span>
            )}
          </div>

          <div className="mt-6 max-w-xs">
            {paidOrderId ? (
              <EmailClaim internalOrderId={paidOrderId} />
            ) : (
              <PayPalButton bookSlug={book.slug} onPaid={setPaidOrderId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
