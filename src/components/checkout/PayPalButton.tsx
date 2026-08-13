'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    paypal?: any;
  }
}

export default function PayPalButton({
  bookSlug,
  onPaid,
}: {
  bookSlug: string;
  onPaid: (internalOrderId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      setError('Checkout is not configured yet.');
      return;
    }

    const renderButtons = () => {
      if (!window.paypal || !ref.current) return;
      ref.current.innerHTML = '';
      window.paypal
        .Buttons({
          style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'pay' },
          createOrder: async () => {
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookSlug }), // refSlug is read from the httpOnly cookie server-side
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? 'Could not start checkout');
            ref.current!.dataset.internalOrderId = data.internalOrderId;
            return data.paypalOrderId;
          },
          onApprove: async (data: { orderID: string }) => {
            const internalOrderId = ref.current?.dataset.internalOrderId;
            const res = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ internalOrderId, paypalOrderId: data.orderID }),
            });
            const result = await res.json();
            if (res.ok && result.status === 'paid' && internalOrderId) {
              onPaid(internalOrderId);
            } else {
              setError('Payment could not be confirmed. You have not been charged for a failed confirmation.');
            }
          },
          onError: () => setError('Something went wrong with PayPal. Please try again.'),
        })
        .render(ref.current);
    };

    if (window.paypal) {
      renderButtons();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = renderButtons;
    document.body.appendChild(script);
  }, [bookSlug, onPaid]);

  if (error) return <p className="font-hud text-xs text-accent">{error}</p>;
  return <div ref={ref} />;
}
